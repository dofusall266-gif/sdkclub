import { type Period, PERIODS, periodStarts } from "@/lib/scoring"
import { readJSON, writeJSON } from "@/lib/storage"

const KEY = "sc_points_v1"
const RANK_KEY = "sc_points_rank_v1"

interface Entry {
  id: string
  /** Horodatage (ms). */
  t: number
  p: number
}

/** Journal local des points gagnés (les totaux jour / semaine / mois / total s'en déduisent, même sans pseudo). */
export function recordPoints(id: string, points: number): void {
  const log = readJSON<Entry[]>(KEY) ?? []
  if (log.some((e) => e.id === id)) return
  log.push({ id, t: Date.now(), p: points })
  writeJSON(KEY, log.slice(-2000))
}

export function getLocalTotals(now: Date = new Date()): Record<Period, number> {
  const log = readJSON<Entry[]>(KEY) ?? []
  const starts = periodStarts(now)
  const totals = { day: 0, week: 0, month: 0, all: 0 } as Record<Period, number>
  for (const e of log) for (const p of PERIODS) if (e.t >= starts[p].getTime()) totals[p] += e.p
  return totals
}

const BEST_KEY = "sc_best_score_v1"

/** Meilleur score obtenu sur une seule partie (depuis toujours, sur cet appareil). */
export function getBestScore(): number {
  return readJSON<number>(BEST_KEY) ?? 0
}

/** Enregistre le score s'il bat le meilleur. Renvoie `true` seulement si un record existait déjà et vient d'être battu. */
export function maybeRecordBestScore(points: number): boolean {
  const best = getBestScore()
  if (points <= best) return false
  writeJSON(BEST_KEY, points)
  if (typeof window !== "undefined") window.dispatchEvent(new Event("sc:score-updated"))
  return best > 0
}

export function getLastRank(): number | null {
  return readJSON<number>(RANK_KEY)
}

export function setLastRank(rank: number): void {
  writeJSON(RANK_KEY, rank)
}
