import type { Difficulty } from "@/lib/sudoku"
import { readJSON, writeJSON } from "@/lib/storage"

const STREAK_KEY = "sc_streak_v1"
const BESTS_KEY = "sc_bests_v1"

interface StreakData {
  count: number
  lastPlayedDate: string // YYYY-MM-DD, heure locale du navigateur
}

function todayLocal(): string {
  const d = new Date()
  const tz = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tz).toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}

export function getStreak(): number {
  return readJSON<StreakData>(STREAK_KEY)?.count ?? 0
}

/**
 * À appeler à chaque victoire. Retourne `{ count, increased }` :
 * - `increased` est vrai seulement si c'est la première victoire du jour qui
 *   fait progresser la série (utile pour ne déclencher l'animation qu'une fois).
 */
export function recordWinForStreak(): { count: number; increased: boolean } {
  const today = todayLocal()
  const data = readJSON<StreakData>(STREAK_KEY)

  if (!data) {
    const next = { count: 1, lastPlayedDate: today }
    writeJSON(STREAK_KEY, next)
    return { count: 1, increased: true }
  }

  if (data.lastPlayedDate === today) {
    return { count: data.count, increased: false } // déjà joué aujourd'hui
  }

  const gap = daysBetween(data.lastPlayedDate, today)
  const count = gap === 1 ? data.count + 1 : 1 // consécutif -> +1, sinon on repart de 1
  writeJSON(STREAK_KEY, { count, lastPlayedDate: today })
  return { count, increased: true }
}

type Bests = Partial<Record<Difficulty, number>>

export function getBestTime(difficulty: Difficulty): number | null {
  return readJSON<Bests>(BESTS_KEY)?.[difficulty] ?? null
}

/** Enregistre un temps s'il bat le record existant (uniquement pour les grilles sans erreur). Retourne `true` si c'est un nouveau record. */
export function maybeRecordBest(difficulty: Difficulty, seconds: number, mistakes: number): boolean {
  if (mistakes > 0) return false
  const bests = readJSON<Bests>(BESTS_KEY) ?? {}
  const current = bests[difficulty]
  if (current !== undefined && seconds >= current) return false
  bests[difficulty] = seconds
  writeJSON(BESTS_KEY, bests)
  return true
}
