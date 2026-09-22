import { createSeededRandom, generatePuzzle, hashSeed, type Puzzle } from "@/lib/sudoku"

/** Difficulté fixe du défi du jour : assez difficile pour être un vrai défi,
 * mais pas "expert" pour que le maximum de joueurs puisse le terminer. */
export const DAILY_DIFFICULTY = "difficile" as const

/** Date du jour au format YYYY-MM-DD, en UTC : tout le monde a la même grille
 * le même jour, quel que soit son fuseau horaire (léger décalage possible au
 * changement de jour selon les fuseaux, acceptable pour un défi quotidien). */
export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Vrai si le défi d'aujourd'hui a déjà été résolu sur cet appareil (lu depuis
 * la sauvegarde locale de la partie du défi). Sert uniquement à l'affichage
 * (pastille de navigation, bannière) — la source de vérité reste le classement. */
export function hasCompletedDailyToday(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = window.localStorage.getItem(`sc_daily_game_v1_${todayKey()}`)
    if (!raw) return false
    const parsed = JSON.parse(raw) as { status?: string }
    return parsed?.status === "won"
  } catch {
    return false
  }
}
const SUBMITTED_KEY_PREFIX = "sc_daily_submitted_v1_"

/** Marque le score du jour comme déjà envoyé au classement (par appareil). */
export function markDailySubmitted(dateKey: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(`${SUBMITTED_KEY_PREFIX}${dateKey}`, "1")
  } catch {
    // ignore
  }
}

export function hasSubmittedDaily(dateKey: string): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(`${SUBMITTED_KEY_PREFIX}${dateKey}`) === "1"
  } catch {
    return false
  }
}

export function getDailyPuzzle(dateKey: string = todayKey()): Puzzle {
  const seed = hashSeed(`sudoku-club-daily-v1-${dateKey}`)
  const random = createSeededRandom(seed)
  return generatePuzzle(DAILY_DIFFICULTY, random)
}
