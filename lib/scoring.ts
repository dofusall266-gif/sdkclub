import type { Difficulty } from "@/lib/sudoku"

/**
 * Système de points de Sudoku-Club (parties libres).
 *  - chaque case juste rapporte les points du niveau × le multiplicateur de combo ;
 *  - le combo = nombre de bonnes réponses d'affilée (une erreur le remet à zéro, sans enlever de points) ;
 *  - bonus de temps : jusqu'à +50 % des points « de base » de la grille, décroissant jusqu'au temps de référence du niveau ;
 *  - partie sans faute : +25 %.
 */
export const LEVEL_POINTS: Record<Difficulty, number> = {
  facile: 10,
  moyen: 15,
  difficile: 25,
  expert: 40,
  diabolique: 60,
  fou: 80,
}

/** Temps de référence (secondes) : au-delà, le bonus de temps tombe à 0. */
export const REFERENCE_SECONDS: Record<Difficulty, number> = {
  facile: 300,
  moyen: 480,
  difficile: 720,
  expert: 1080,
  diabolique: 1500,
  fou: 2100,
}

/** Temps minimal plausible pour finir une grille (anti-triche côté serveur). */
export const MIN_SECONDS: Record<Difficulty, number> = {
  facile: 40,
  moyen: 60,
  difficile: 90,
  expert: 120,
  diabolique: 150,
  fou: 180,
}

/** Paliers de combo : à `at` bonnes réponses d'affilée, le multiplicateur est tiré au hasard entre `min` et `max` (à chaque partie). */
export const COMBO_TIERS = [
  { at: 3, min: 1.2, max: 1.4 },
  { at: 7, min: 1.5, max: 1.68 },
  { at: 10, min: 1.75, max: 2.01 },
  { at: 20, min: 2.33, max: 2.44 },
] as const

const round2 = (n: number) => Math.round(n * 100) / 100

export const DEFAULT_MULTIPLIERS: number[] = COMBO_TIERS.map((t) => round2((t.min + t.max) / 2))

/** Tire les 4 multiplicateurs d'une partie (un par palier). */
export function rollMultipliers(): number[] {
  return COMBO_TIERS.map((t) => round2(t.min + Math.random() * (t.max - t.min)))
}

/** Multiplicateur en vigueur pour une série de `streak` bonnes réponses. */
export function comboMultiplier(streak: number, multipliers: number[] = DEFAULT_MULTIPLIERS): number {
  let m = 1
  COMBO_TIERS.forEach((t, i) => {
    if (streak >= t.at) m = multipliers[i] ?? DEFAULT_MULTIPLIERS[i]
  })
  return m
}

/** Index du palier atteint pile à cette série (0..3), ou -1. */
export function tierReachedAt(streak: number): number {
  return COMBO_TIERS.findIndex((t) => t.at === streak)
}

export interface ScoreBreakdown {
  /** Points de base des cases justes (sans combo). */
  resolution: number
  /** Points supplémentaires gagnés grâce aux combos. */
  combo: number
  time: number
  flawless: number
  total: number
}

export function finalScore(args: {
  difficulty: Difficulty
  basePoints: number
  points: number
  seconds: number
  mistakes: number
  emptyCells: number
}): ScoreBreakdown {
  const base = LEVEL_POINTS[args.difficulty]
  const ref = REFERENCE_SECONDS[args.difficulty]
  const time = Math.round(args.emptyCells * base * 0.5 * Math.max(0, 1 - args.seconds / ref))
  const sub = args.points + time
  const flawless = args.mistakes === 0 ? Math.round(sub * 0.25) : 0
  return { resolution: args.basePoints, combo: args.points - args.basePoints, time, flawless, total: sub + flawless }
}

/** Score maximal théorique d'une partie (borne large, pour rejeter les valeurs absurdes côté serveur). */
export function maxPossibleScore(difficulty: Difficulty): number {
  const base = LEVEL_POINTS[difficulty]
  return Math.ceil((60 * base * 2.44 + 30 * base) * 1.25)
}

export type Period = "day" | "week" | "month" | "all"
export const PERIODS: Period[] = ["day", "week", "month", "all"]

/** Début de chaque période, en UTC (jour, semaine du lundi, mois civil). Même règle côté navigateur et serveur. */
export function periodStarts(now: Date = new Date()): Record<Period, Date> {
  const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dow = (day.getUTCDay() + 6) % 7 // lundi = 0
  return {
    day,
    week: new Date(day.getTime() - dow * 86400000),
    month: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
    all: new Date(0),
  }
}
