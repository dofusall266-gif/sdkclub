import { randomUUID } from "node:crypto"

import { createRemoteJWKSet, jwtVerify } from "jose"
import { NextResponse } from "next/server"

import { ensureAccountsTable, ensureDailyScoresTable, ensurePointsTable, getDb } from "@/lib/db"
import { isValidCountryCode, sanitizePseudo } from "@/lib/moderation"

/**
 * Connexion / création de compte avec Google (Google Identity Services).
 *
 * Le navigateur envoie le jeton d'identité (`credential`) fourni par Google. On le vérifie
 * (signature, émetteur, destinataire, expiration), puis :
 *  - compte déjà connu  -> on renvoie son identifiant joueur (et on rattache les points de cet appareil) ;
 *  - compte inconnu     -> on rattache l'identifiant joueur actuel de l'appareil au compte Google,
 *                          donc tous les points déjà gagnés sont conservés.
 * On ne stocke que `sub`, l'identifiant anonyme de Google (pas d'email, pas de nom).
 */

const GOOGLE_JWKS = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"))

async function verifyGoogleCredential(credential: string, clientId: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ["https://accounts.google.com", "accounts.google.com"],
      audience: clientId,
    })
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null
  } catch {
    return null
  }
}

interface AccountRow {
  player_id: string
  pseudo: string
  country_code: string | null
}

type Sql = NonNullable<ReturnType<typeof getDb>>

/** Rattache les scores d'un ancien identifiant (`fromId`) au compte, sans jamais violer les contraintes d'unicité. */
async function mergePlayer(sql: Sql, fromId: string, acc: AccountRow) {
  await sql.transaction([
    sql`UPDATE points_scores
        SET player_id = ${acc.player_id}
        WHERE player_id = ${fromId}
          AND game_id NOT IN (SELECT game_id FROM points_scores WHERE player_id = ${acc.player_id})`,
    sql`UPDATE daily_scores
        SET player_id = ${acc.player_id}
        WHERE player_id = ${fromId}
          AND date NOT IN (SELECT date FROM daily_scores WHERE player_id = ${acc.player_id})`,
    // Le pseudo et le pays du compte l'emportent sur ceux de l'appareil.
    sql`UPDATE points_scores SET pseudo = ${acc.pseudo}, country_code = ${acc.country_code} WHERE player_id = ${acc.player_id}`,
    sql`UPDATE daily_scores SET pseudo = ${acc.pseudo}, country_code = ${acc.country_code} WHERE player_id = ${acc.player_id}`,
  ])
}

export async function POST(req: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  if (!clientId) return NextResponse.json({ ok: false, reason: "not-configured" })
  const sql = getDb()
  if (!sql) return NextResponse.json({ ok: false, reason: "no-database" })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-body" }, { status: 400 })
  }
  const b = body as Record<string, unknown>

  const credential = typeof b.credential === "string" ? b.credential.slice(0, 4096) : ""
  if (!credential) return NextResponse.json({ ok: false, reason: "invalid-credential" }, { status: 400 })
  const sub = await verifyGoogleCredential(credential, clientId)
  if (!sub) return NextResponse.json({ ok: false, reason: "invalid-credential" }, { status: 401 })

  const localId = typeof b.playerId === "string" ? b.playerId.slice(0, 64) : ""
  const localPseudo = sanitizePseudo(typeof b.pseudo === "string" ? b.pseudo : "") ?? "Player"
  const localCountry = isValidCountryCode(b.countryCode) ? b.countryCode : null

  try {
    await ensurePointsTable(sql)
    await ensureDailyScoresTable(sql)
    await ensureAccountsTable(sql)

    const found = (await sql`
      SELECT player_id, pseudo, country_code FROM accounts WHERE google_sub = ${sub}
    `) as AccountRow[]

    // L'identifiant de cet appareil est-il déjà rattaché à un compte (le sien ou celui de quelqu'un d'autre) ?
    const localTaken = localId
      ? ((await sql`SELECT 1 FROM accounts WHERE player_id = ${localId} LIMIT 1`) as unknown[]).length > 0
      : false

    if (found[0]) {
      const acc = found[0]
      let merged = false
      if (localId && localId !== acc.player_id && !localTaken) {
        await mergePlayer(sql, localId, acc)
        merged = true
      }
      return NextResponse.json({
        ok: true,
        created: false,
        merged,
        playerId: acc.player_id,
        pseudo: acc.pseudo,
        countryCode: acc.country_code,
      })
    }

    // Nouveau compte : on garde l'identifiant de l'appareil (donc ses points), sauf s'il appartient déjà à un autre compte.
    const playerId = localId && !localTaken ? localId : randomUUID()
    await sql`
      INSERT INTO accounts (google_sub, player_id, pseudo, country_code)
      VALUES (${sub}, ${playerId}, ${localPseudo}, ${localCountry})
      ON CONFLICT (google_sub) DO NOTHING
    `
    const row = ((await sql`
      SELECT player_id, pseudo, country_code FROM accounts WHERE google_sub = ${sub}
    `) as AccountRow[])[0]
    return NextResponse.json({
      ok: true,
      created: row.player_id === playerId,
      merged: false,
      playerId: row.player_id,
      pseudo: row.pseudo,
      countryCode: row.country_code,
    })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error" }, { status: 500 })
  }
}
