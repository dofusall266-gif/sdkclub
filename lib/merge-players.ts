import type { getDb } from "@/lib/db"
import { sanitizePseudo } from "@/lib/moderation"

type Sql = NonNullable<ReturnType<typeof getDb>>

export interface MergeResult {
  games: number
  daily: number
  pseudo: string
}

async function latestIdentity(sql: Sql, id: string): Promise<{ pseudo: string; country_code: string | null } | null> {
  const rows = (await sql`
    SELECT pseudo, country_code FROM (
      SELECT pseudo, country_code, created_at FROM points_scores WHERE player_id = ${id}
      UNION ALL
      SELECT pseudo, country_code, created_at FROM daily_scores WHERE player_id = ${id}
    ) t ORDER BY created_at DESC LIMIT 1
  `) as { pseudo: string; country_code: string | null }[]
  return rows[0] ?? null
}

/**
 * Fusionne tous les scores de `oldId` dans `newId` (parties libres et défis du jour), puis supprime `oldId`.
 * - Pseudo / pays conservés : ceux du compte Google de `newId` s'il existe, sinon ceux de sa dernière partie.
 * - Jour de défi en commun : on garde le meilleur temps.
 * - Refuse si `oldId` est relié à un compte Google (sinon ce compte perdrait ses points).
 * Lève une Error au message lisible en cas de problème.
 */
export async function mergePlayers(sql: Sql, oldId: string, newId: string, keepPseudo?: string): Promise<MergeResult> {
  if (!oldId || !newId || oldId === newId) throw new Error("Choisis deux joueurs différents.")

  const oldLinked = (await sql`SELECT 1 FROM accounts WHERE player_id = ${oldId} LIMIT 1`) as unknown[]
  if (oldLinked.length > 0) {
    throw new Error("Le joueur à absorber est relié à un compte Google : inverse les deux joueurs (garde celui qui a le compte Google).")
  }

  const oldIdentity = await latestIdentity(sql, oldId)
  if (!oldIdentity) throw new Error("Aucun score trouvé pour le joueur à absorber.")

  const account = (await sql`SELECT pseudo, country_code FROM accounts WHERE player_id = ${newId} LIMIT 1`) as {
    pseudo: string
    country_code: string | null
  }[]
  const target = account[0] ?? (await latestIdentity(sql, newId)) ?? oldIdentity

  const custom = keepPseudo ? sanitizePseudo(keepPseudo) : null
  const pseudo = custom ?? target.pseudo
  const country = target.country_code

  const results = (await sql.transaction([
    // Parties libres : on déplace celles qui n'existent pas déjà chez le joueur conservé.
    sql`UPDATE points_scores SET player_id = ${newId}
        WHERE player_id = ${oldId}
          AND game_id NOT IN (SELECT game_id FROM points_scores WHERE player_id = ${newId})
        RETURNING 1`,
    sql`DELETE FROM points_scores WHERE player_id = ${oldId}`,
    // Défis du jour : en cas de jour commun, on garde le meilleur temps.
    sql`UPDATE daily_scores t SET seconds = s.seconds, mistakes = s.mistakes
        FROM daily_scores s
        WHERE s.player_id = ${oldId} AND t.player_id = ${newId} AND s.date = t.date AND s.seconds < t.seconds`,
    sql`UPDATE daily_scores SET player_id = ${newId}
        WHERE player_id = ${oldId}
          AND date NOT IN (SELECT date FROM daily_scores WHERE player_id = ${newId})
        RETURNING 1`,
    sql`DELETE FROM daily_scores WHERE player_id = ${oldId}`,
    sql`UPDATE points_scores SET pseudo = ${pseudo}, country_code = ${country} WHERE player_id = ${newId}`,
    sql`UPDATE daily_scores SET pseudo = ${pseudo}, country_code = ${country} WHERE player_id = ${newId}`,
    sql`UPDATE accounts SET pseudo = ${pseudo}, country_code = ${country} WHERE player_id = ${newId}`,
  ])) as unknown[][]

  return { games: results[0]?.length ?? 0, daily: results[3]?.length ?? 0, pseudo }
}
