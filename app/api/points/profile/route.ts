import { NextResponse } from "next/server"

import { ensureDailyScoresTable, ensurePointsTable, getDb } from "@/lib/db"
import { isValidCountryCode, sanitizePseudo } from "@/lib/moderation"

/** Gestion du profil public d'un joueur (sans compte : il est identifié par son id aléatoire).
 *  - action "update" : change le pseudo / pays sur tous ses scores (classement général + défi du jour).
 *  - action "leave"  : supprime tous ses scores des classements. */
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
  if (!playerId) return NextResponse.json({ ok: false, reason: "missing-player" }, { status: 400 })

  try {
    await ensurePointsTable(sql)
    await ensureDailyScoresTable(sql)

    if (b.action === "leave") {
      await sql`DELETE FROM points_scores WHERE player_id = ${playerId}`
      await sql`DELETE FROM daily_scores WHERE player_id = ${playerId}`
      return NextResponse.json({ ok: true })
    }

    if (b.action === "update") {
      const pseudo = sanitizePseudo(typeof b.pseudo === "string" ? b.pseudo : "")
      if (!pseudo) return NextResponse.json({ ok: false, reason: "invalid-pseudo" }, { status: 400 })
      const countryCode = isValidCountryCode(b.countryCode) ? b.countryCode : null
      await sql`UPDATE points_scores SET pseudo = ${pseudo}, country_code = ${countryCode} WHERE player_id = ${playerId}`
      await sql`UPDATE daily_scores SET pseudo = ${pseudo}, country_code = ${countryCode} WHERE player_id = ${playerId}`
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: false, reason: "invalid-action" }, { status: 400 })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error" }, { status: 500 })
  }
}
