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

/** Génère (toujours la même) grille du défi pour une date donnée. */
export function getDailyPuzzle(dateKey: string = todayKey()): Puzzle {
  const seed = hashSeed(`sudoku-club-daily-v1-${dateKey}`)
  const random = createSeededRandom(seed)
  return generatePuzzle(DAILY_DIFFICULTY, random)
}
