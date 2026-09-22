import { NextResponse } from "next/server"

import { ensureDailyScoresTable, getDb } from "@/lib/db"
import { todayKey } from "@/lib/daily"

export async function GET(req: Request) {
  const sql = getDb()
  if (!sql) {
    return NextResponse.json({ ok: false, reason: "no-database", scores: [] })
  }

  const url = new URL(req.url)
  // Uniquement le jour courant pour l'instant : évite d'exposer une API de
  // requête libre sur des dates arbitraires.
  const date = url.searchParams.get("date") === todayKey() ? todayKey() : todayKey()

  try {
    await ensureDailyScoresTable(sql)
    const rows = await sql`
      SELECT pseudo, country_code, seconds, mistakes
      FROM daily_scores
      WHERE date = ${date}
      ORDER BY seconds ASC
      LIMIT 50
    `
    return NextResponse.json({ ok: true, date, scores: rows })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error", scores: [] }, { status: 500 })
  }
}
