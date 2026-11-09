import { NextResponse } from "next/server"

import { ensurePointsTable, getDb } from "@/lib/db"
import { isValidCountryCode, sanitizePseudo } from "@/lib/moderation"
import { LEVEL_POINTS, MIN_SECONDS, maxPossibleScore, periodStarts } from "@/lib/scoring"
import type { Difficulty } from "@/lib/sudoku"

export async function POST(req: Request) {
  const sql = getDb()
  if (!sql) return NextResponse.json({ ok: false, reason: "no-database" })

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-body" }, { status: 400 })
  }
  const b = body as Record<string, unknown>

  const playerId = typeof b.playerId === "string" ? b.playerId.slice(0, 64) : ""
  const gameId = typeof b.gameId === "string" ? b.gameId.slice(0, 64) : ""
  if (!playerId || gameId.length < 8) return NextResponse.json({ ok: false, reason: "missing-player" }, { status: 400 })

  const pseudo = sanitizePseudo(typeof b.pseudo === "string" ? b.pseudo : "")
  if (!pseudo) return NextResponse.json({ ok: false, reason: "invalid-pseudo" }, { status: 400 })
  const countryCode = isValidCountryCode(b.countryCode) ? b.countryCode : null

  const level = typeof b.difficulty === "string" && b.difficulty in LEVEL_POINTS ? (b.difficulty as Difficulty) : null
  const points = typeof b.points === "number" ? Math.round(b.points) : NaN
  const seconds = typeof b.seconds === "number" ? Math.round(b.seconds) : NaN
  const mistakes = typeof b.mistakes === "number" ? Math.round(b.mistakes) : 0
  const daily = b.daily === true

  // Anti-abus minimal (le score est calculé dans le navigateur) : valeurs plausibles uniquement.
  if (!level) return NextResponse.json({ ok: false, reason: "invalid-level" }, { status: 400 })
  if (!Number.isFinite(seconds) || seconds < MIN_SECONDS[level] || seconds > 14400)
    return NextResponse.json({ ok: false, reason: "invalid-seconds" }, { status: 400 })
  if (!Number.isFinite(points) || points < 1 || points > Math.ceil(maxPossibleScore(level) * (daily ? 1.25 : 1)))
    return NextResponse.json({ ok: false, reason: "invalid-points" }, { status: 400 })
  if (mistakes < 0 || mistakes > 300) return NextResponse.json({ ok: false, reason: "invalid-mistakes" }, { status: 400 })

  try {
    await ensurePointsTable(sql)
    const recent = await sql`
      SELECT 1 FROM points_scores WHERE player_id = ${playerId} AND created_at > now() - interval '20 seconds' LIMIT 1
    `
    if (recent.length > 0) return NextResponse.json({ ok: false, reason: "too-fast" }, { status: 429 })

    await sql`
      INSERT INTO points_scores (game_id, player_id, pseudo, country_code, level, points, seconds, mistakes)
      VALUES (${gameId}, ${playerId}, ${pseudo}, ${countryCode}, ${level}, ${points}, ${seconds}, ${mistakes})
      ON CONFLICT (player_id, game_id) DO NOTHING
    `

    const s = periodStarts()
    const sums = (await sql`
      SELECT
        COALESCE(SUM(points) FILTER (WHERE created_at >= ${s.day.toISOString()}), 0)::int AS day,
        COALESCE(SUM(points) FILTER (WHERE created_at >= ${s.week.toISOString()}), 0)::int AS week,
        COALESCE(SUM(points) FILTER (WHERE created_at >= ${s.month.toISOString()}), 0)::int AS month,
        COALESCE(SUM(points), 0)::int AS "all"
      FROM points_scores WHERE player_id = ${playerId}
    `) as { day: number; week: number; month: number; all: number }[]
    const totals = sums[0]
    const better = (await sql`
      SELECT COUNT(*)::int AS n FROM (
        SELECT player_id, SUM(points) AS total FROM points_scores GROUP BY player_id
      ) t WHERE total > ${totals.all}
    `) as { n: number }[]

    return NextResponse.json({ ok: true, totals, rank: better[0].n + 1 })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error" }, { status: 500 })
  }
}
