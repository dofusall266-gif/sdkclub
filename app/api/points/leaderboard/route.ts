import { NextResponse } from "next/server"

import { ensurePointsTable, getDb } from "@/lib/db"
import { PERIODS, type Period, periodStarts } from "@/lib/scoring"

const TOP_N = 50

interface Row {
  pseudo: string
  country_code: string | null
  total: number
  games: number
}

export async function GET(req: Request) {
  const sql = getDb()
  if (!sql) return NextResponse.json({ ok: false, reason: "no-database", scores: [], me: null })

  const url = new URL(req.url)
  const asked = url.searchParams.get("period")
  const period: Period = PERIODS.includes(asked as Period) ? (asked as Period) : "day"
  const playerId = url.searchParams.get("playerId")?.slice(0, 64) ?? null
  const since = periodStarts()[period].toISOString()

  try {
    await ensurePointsTable(sql)
    const scores = (await sql`
      SELECT
        (array_agg(pseudo ORDER BY created_at DESC))[1] AS pseudo,
        (array_agg(country_code ORDER BY created_at DESC))[1] AS country_code,
        SUM(points)::int AS total,
        COUNT(*)::int AS games
      FROM points_scores
      WHERE created_at >= ${since}
      GROUP BY player_id
      ORDER BY total DESC
      LIMIT ${TOP_N}
    `) as Row[]

    let me: (Row & { rank: number }) | null = null
    if (playerId) {
      const rows = (await sql`
        SELECT pseudo, country_code, total, games, rank FROM (
          SELECT player_id,
                 (array_agg(pseudo ORDER BY created_at DESC))[1] AS pseudo,
                 (array_agg(country_code ORDER BY created_at DESC))[1] AS country_code,
                 SUM(points)::int AS total,
                 COUNT(*)::int AS games,
                 rank() OVER (ORDER BY SUM(points) DESC)::int AS rank
          FROM points_scores
          WHERE created_at >= ${since}
          GROUP BY player_id
        ) r WHERE player_id = ${playerId}
      `) as (Row & { rank: number })[]
      me = rows[0] ?? null
    }
    return NextResponse.json({ ok: true, period, scores, me })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error", scores: [], me: null }, { status: 500 })
  }
}
