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

export function getLastRank(): number | null {
  return readJSON<number>(RANK_KEY)
}

export function setLastRank(rank: number): void {
  writeJSON(RANK_KEY, rank)
}
