import { NextResponse } from "next/server"

import { ensureDailyScoresTable, getDb } from "@/lib/db"
import { isValidCountryCode, sanitizePseudo } from "@/lib/moderation"
import { todayKey } from "@/lib/daily"

export async function POST(req: Request) {
  const sql = getDb()
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
    date?: string
    playerId?: string
    pseudo?: string
    countryCode?: string
    seconds?: number
    mistakes?: number
  }

  // On ne fait confiance qu'à la date du jour côté serveur (évite qu'un client
  // avec une horloge décalée pollue un autre jour du classement).
  const date = todayKey()
  if (payload.date && payload.date !== date) {
    return NextResponse.json({ ok: false, reason: "stale-date" }, { status: 400 })
  }

  const playerId = typeof payload.playerId === "string" ? payload.playerId.slice(0, 64) : ""
  if (!playerId) {
    return NextResponse.json({ ok: false, reason: "missing-player" }, { status: 400 })
  }

  const pseudo = sanitizePseudo(payload.pseudo ?? "")
  if (!pseudo) {
    return NextResponse.json({ ok: false, reason: "invalid-pseudo" }, { status: 400 })
  }

  const countryCode = isValidCountryCode(payload.countryCode) ? payload.countryCode : null

  const seconds = typeof payload.seconds === "number" ? Math.round(payload.seconds) : NaN
  const mistakes = typeof payload.mistakes === "number" ? Math.round(payload.mistakes) : 0

  // Anti-abus minimal : un temps réaliste (entre 10s et 2h). Pour les erreurs,
  // le jeu ne s'arrête jamais à un certain nombre de fautes (on peut terminer
  // la grille après en avoir fait beaucoup), donc on ne bloque qu'une valeur
  // clairement absurde plutôt qu'un plafond bas qui rejetterait des scores réels.
  if (!Number.isFinite(seconds) || seconds < 10 || seconds > 7200) {
    return NextResponse.json({ ok: false, reason: "invalid-seconds" }, { status: 400 })
  }
  if (mistakes < 0 || mistakes > 300) {
    return NextResponse.json({ ok: false, reason: "invalid-mistakes" }, { status: 400 })
  }

  try {
    await ensureDailyScoresTable(sql)
    // Le défi n'est censé être joué qu'une fois, mais un double envoi (double
    // clic, requête réseau relancée) reste possible : on ne garde alors que
    // la meilleure tentative EN ENTIER (temps + erreurs ensemble), jamais un
    // mélange du temps d'une tentative et des erreurs d'une autre.
    await sql`
      INSERT INTO daily_scores (date, player_id, pseudo, country_code, seconds, mistakes)
      VALUES (${date}, ${playerId}, ${pseudo}, ${countryCode}, ${seconds}, ${mistakes})
      ON CONFLICT (date, player_id) DO UPDATE SET
        seconds = CASE WHEN EXCLUDED.seconds < daily_scores.seconds THEN EXCLUDED.seconds ELSE daily_scores.seconds END,
        mistakes = CASE WHEN EXCLUDED.seconds < daily_scores.seconds THEN EXCLUDED.mistakes ELSE daily_scores.mistakes END,
        pseudo = EXCLUDED.pseudo,
        country_code = EXCLUDED.country_code
    `
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, reason: "db-error" }, { status: 500 })
  }
}
