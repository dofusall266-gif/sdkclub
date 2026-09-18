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

  const type = (body as { type?: string })?.type
  const difficulty = (body as { difficulty?: string })?.difficulty ?? null

  if (!type || !VALID_TYPES.includes(type as EventType)) {
    return NextResponse.json({ ok: false, reason: "invalid-type" }, { status: 400 })
  }

  try {
    await ensureEventsTable(sql)
    await sql`INSERT INTO events (type, difficulty) VALUES (${type}, ${difficulty})`
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error" }, { status: 500 })
  }
}
