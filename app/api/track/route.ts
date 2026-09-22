import { NextResponse } from "next/server"

import { ensureEventsTable, getDb } from "@/lib/db"

const VALID_TYPES = ["game_started", "game_won"] as const
type EventType = (typeof VALID_TYPES)[number]

export async function POST(req: Request) {
  const sql = getDb()
  // Si Neon n'est pas connecté, on ne bloque jamais le site : on répond
  // simplement "ok: false" sans erreur visible pour l'utilisateur.
  if (!sql) {
    return NextResponse.json({ ok: false, reason: "no-database" })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-body" }, { status: 400 })
  }

  const payload = body as {
    type?: string
    difficulty?: string
    duration_seconds?: number
    mistakes?: number
    device?: string
  }
  const type = payload?.type
  const difficulty = payload?.difficulty ?? null
  const durationSeconds =
    typeof payload?.duration_seconds === "number" && Number.isFinite(payload.duration_seconds)
      ? Math.round(payload.duration_seconds)
      : null
  const mistakes =
    typeof payload?.mistakes === "number" && Number.isFinite(payload.mistakes) ? Math.round(payload.mistakes) : null
  const device = typeof payload?.device === "string" ? payload.device.slice(0, 20) : null

  if (!type || !VALID_TYPES.includes(type as EventType)) {
    return NextResponse.json({ ok: false, reason: "invalid-type" }, { status: 400 })
  }

  try {
    await ensureEventsTable(sql)
    await sql`
      INSERT INTO events (type, difficulty, duration_seconds, mistakes, device)
      VALUES (${type}, ${difficulty}, ${durationSeconds}, ${mistakes}, ${device})
    `
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error" }, { status: 500 })
  }
}
