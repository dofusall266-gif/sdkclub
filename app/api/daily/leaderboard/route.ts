import { NextResponse } from "next/server"

import { ensureDailyScoresTable, getDb } from "@/lib/db"
import { PENALTY_SECONDS_PER_MISTAKE, todayKey } from "@/lib/daily"

const TOP_N = 20

export async function GET(req: Request) {
  const sql = getDb()
  if (!sql) {
    return NextResponse.json({ ok: false, reason: "no-database", scores: [], me: null })
  }

  const url = new URL(req.url)
  // Uniquement le jour courant pour l'instant : évite d'exposer une API de
  // requête libre sur des dates arbitraires.
  const date = url.searchParams.get("date") === todayKey() ? todayKey() : todayKey()
  const playerId = url.searchParams.get("playerId")?.slice(0, 64) ?? null
  const penalty = PENALTY_SECONDS_PER_MISTAKE

  try {
    await ensureDailyScoresTable(sql)
    // Le classement trie sur le temps + une pénalité par erreur, mais le temps
    // RÉEL (non pénalisé) est ce qui est renvoyé et affiché — la pénalité ne
    // sert qu'à départager, jamais montrée comme un faux temps.
    const rows = await sql`
      SELECT pseudo, country_code, seconds, mistakes
      FROM daily_scores
      WHERE date = ${date}
      ORDER BY (seconds + mistakes * ${penalty}) ASC
      LIMIT ${TOP_N}
    `

    // Rang exact du joueur (même s'il est en dehors du top 20), via une
    // fonction fenêtrée : évite de charger tout le classement pour le calculer.
    let me: { pseudo: string; country_code: string | null; seconds: number; mistakes: number; rank: number } | null =
      null
    if (playerId) {
      const meRows = await sql`
        SELECT pseudo, country_code, seconds, mistakes, rank FROM (
          SELECT pseudo, country_code, seconds, mistakes, player_id,
                 rank() OVER (ORDER BY (seconds + mistakes * ${penalty}) ASC) AS rank
          FROM daily_scores
          WHERE date = ${date}
        ) ranked
        WHERE player_id = ${playerId}
      `
      const row = meRows[0] as
        | { pseudo: string; country_code: string | null; seconds: number; mistakes: number; rank: number }
        | undefined
      me = row ?? null
    }

    return NextResponse.json({ ok: true, date, scores: rows, me, penalty })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error", scores: [], me: null }, { status: 500 })
  }
}
