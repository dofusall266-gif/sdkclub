import { NextResponse } from "next/server"

import { ensureEventsTable, getDb } from "@/lib/db"

const VALID_TYPES = ["game_started", "game_won", "visit_time"] as const
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
    mode?: string
    rating?: number
    source?: string
    visitor_id?: string
    new_session?: boolean
  }
  const type = payload?.type
  const difficulty = payload?.difficulty ?? null
  let durationSeconds =
    typeof payload?.duration_seconds === "number" && Number.isFinite(payload.duration_seconds)
      ? Math.round(payload.duration_seconds)
      : null
  const newSession = payload?.new_session === true
  const mistakes =
    typeof payload?.mistakes === "number" && Number.isFinite(payload.mistakes) ? Math.round(payload.mistakes) : null
  const device = typeof payload?.device === "string" ? payload.device.slice(0, 20) : null

  const mode = payload?.mode === "daily" ? "daily" : "free"
  const rating =
    typeof payload?.rating === "number" && Number.isFinite(payload.rating) && payload.rating >= 1 && payload.rating <= 100
      ? Math.round(payload.rating)
      : null
  const source =
    typeof payload?.source === "string" && /^[a-z0-9_.-]{1,30}$/.test(payload.source) ? payload.source : null
  const visitorId =
    typeof payload?.visitor_id === "string" && /^[A-Za-z0-9_-]{8,64}$/.test(payload.visitor_id) ? payload.visitor_id : null

  if (!type || !VALID_TYPES.includes(type as EventType)) {
    return NextResponse.json({ ok: false, reason: "invalid-type" }, { status: 400 })
  }

  // Un morceau de « temps passé » ne dépasse jamais une heure (onglet oublié, bug…).
  if (type === "visit_time") {
    if (durationSeconds === null || durationSeconds < 1) return NextResponse.json({ ok: false, reason: "invalid-duration" }, { status: 400 })
    durationSeconds = Math.min(durationSeconds, 3600)
  }

  try {
    await ensureEventsTable(sql)
    await sql`
      INSERT INTO events (type, difficulty, duration_seconds, mistakes, device, mode, rating, source, visitor_id, new_session)
      VALUES (${type}, ${difficulty}, ${durationSeconds}, ${mistakes}, ${device}, ${mode}, ${rating}, ${source}, ${visitorId}, ${newSession})
    `
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error" }, { status: 500 })
  }
}
