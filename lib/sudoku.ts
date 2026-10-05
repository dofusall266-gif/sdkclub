import { PUZZLE_BANK } from "@/lib/puzzle-bank"

export type Grid = number[] // length 81, 0 = empty
export type Difficulty = "facile" | "moyen" | "difficile" | "expert" | "diabolique" | "fou"

/** Ordre d'affichage, du plus doux au plus féroce. */
export const DIFFICULTIES: Difficulty[] = ["facile", "moyen", "difficile", "expert", "diabolique", "fou"]

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
  expert: "Expert",
  diabolique: "Diabolique",
  fou: "Fou",
}

/** Générateur pseudo-aléatoire déterministe (mulberry32). Permet de générer
 * exactement la même grille pour tout le monde à partir d'une même graine —
 * utilisé pour le défi du jour, où chaque joueur doit avoir la même grille. */
export function createSeededRandom(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Hash simple (FNV-1a) pour transformer une chaîne (ex : une date) en graine numérique. */
export function hashSeed(str: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return h >>> 0
}

function shuffle<T>(arr: T[], random: () => number = Math.random): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function rowOf(index: number): number {
  return Math.floor(index / 9)
}

export function colOf(index: number): number {
  return index % 9
}

export function boxOf(index: number): number {
  return Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3)
}

/** Résout une grille (retour arrière, case la plus contrainte d'abord). Rapide, pour une grille à solution unique. */
export function solveGrid(input: Grid): Grid | null {
  const g = [...input]
  const rows = new Array(9).fill(0)
  const cols = new Array(9).fill(0)
  const boxes = new Array(9).fill(0)
  for (let i = 0; i < 81; i++) {
    if (!g[i]) continue
    const m = 1 << g[i]
    rows[rowOf(i)] |= m
    cols[colOf(i)] |= m
    boxes[boxOf(i)] |= m
  }

  function solve(): boolean {
    let best = -1
    let bestFree = 0
    let bestN = 10
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue
      const free = ~(rows[rowOf(i)] | cols[colOf(i)] | boxes[boxOf(i)]) & 0x3fe
      let n = 0
      for (let x = free; x; x &= x - 1) n++
      if (n < bestN) {
        best = i
        bestFree = free
        bestN = n
        if (n <= 1) break
      }
    }
    if (best === -1) return true
    if (bestN === 0) return false
    const r = rowOf(best)
    const c = colOf(best)
    const b = boxOf(best)
    for (let d = 1; d <= 9; d++) {
      const m = 1 << d
      if (!(bestFree & m)) continue
      g[best] = d
      rows[r] |= m
      cols[c] |= m
      boxes[b] |= m
      if (solve()) return true
      g[best] = 0
      rows[r] &= ~m
      cols[c] &= ~m
      boxes[b] &= ~m
    }
    return false
  }

  return solve() ? g : null
}

export interface Puzzle {
  puzzle: Grid // with holes
  solution: Grid // full solution
  difficulty: Difficulty
  /** Note de difficulté de la grille, de 1 à 100 (calculée par le solveur logique). */
  rating: number
}

function permutation3(random: () => number): number[] {
  return shuffle([0, 1, 2], random)
}

/** Ordre aléatoire des 9 lignes (ou colonnes) qui conserve la difficulté :
 * on mélange les 3 bandes, puis les 3 lignes à l'intérieur de chaque bande. */
function lineOrder(random: () => number): number[] {
  const order: number[] = []
  for (const band of permutation3(random)) {
    for (const k of permutation3(random)) order.push(band * 3 + k)
  }
  return order
}

/**
 * Pioche une grille dans la banque (lib/puzzle-bank.ts) pour le niveau demandé,
 * puis la « déguise » : chiffres renumérotés, lignes/colonnes permutées, grille
 * éventuellement transposée. Ces transformations ne changent ni la solution
 * unique ni les techniques nécessaires, donc ni la difficulté, mais la grille
 * paraît toute nouvelle. Tout passe par `random` : avec la même graine (défi
 * du jour), tout le monde obtient exactement la même grille.
 */
export function generatePuzzle(difficulty: Difficulty, random: () => number = Math.random): Puzzle {
  const pool = PUZZLE_BANK[difficulty]
  const entry = pool[Math.floor(random() * pool.length)]
  const rating = Number(entry.slice(0, entry.indexOf(":")))
  const base = Array.from(entry.slice(entry.indexOf(":") + 1), Number)

  const digitMap = [0, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random)]
  const rowsOrder = lineOrder(random)
  const colsOrder = lineOrder(random)
  const transpose = random() < 0.5

  const puzzle: Grid = new Array(81).fill(0)
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const src = rowsOrder[r] * 9 + colsOrder[c]
      puzzle[transpose ? c * 9 + r : r * 9 + c] = digitMap[base[src]]
    }
  }

  const solution = solveGrid(puzzle)
  if (!solution) throw new Error("Grille de la banque invalide")
  return { puzzle, solution, difficulty, rating }
}

// Returns the set of indices that currently conflict with Sudoku rules.
export function findConflicts(grid: Grid): Set<number> {
  const conflicts = new Set<number>()

  const check = (indices: number[]) => {
    const seen = new Map<number, number[]>()
    for (const i of indices) {
      const v = grid[i]
      if (v === 0) continue
      if (!seen.has(v)) seen.set(v, [])
      seen.get(v)!.push(i)
    }
    for (const group of seen.values()) {
      if (group.length > 1) group.forEach((i) => conflicts.add(i))
    }
  }

  for (let r = 0; r < 9; r++) {
    check(Array.from({ length: 9 }, (_, c) => r * 9 + c))
  }
  for (let c = 0; c < 9; c++) {
    check(Array.from({ length: 9 }, (_, r) => r * 9 + c))
  }
  for (let br = 0; br < 3; br++) {
    for (let bc = 0; bc < 3; bc++) {
      const cells: number[] = []
      for (let dr = 0; dr < 3; dr++) {
        for (let dc = 0; dc < 3; dc++) {
          cells.push((br * 3 + dr) * 9 + (bc * 3 + dc))
        }
      }
      check(cells)
    }
  }

  return conflicts
}

export function isComplete(grid: Grid): boolean {
  return grid.every((v) => v !== 0)
}

export function isSolved(grid: Grid, solution: Grid): boolean {
  return grid.every((v, i) => v === solution[i])
}

/** Indices de la ligne, la colonne et le bloc 3×3 auxquels appartient une case. */
export function groupIndices(index: number): { row: number[]; col: number[]; box: number[] } {
  const r = rowOf(index)
  const c = colOf(index)
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  const row = Array.from({ length: 9 }, (_, i) => r * 9 + i)
  const col = Array.from({ length: 9 }, (_, i) => i * 9 + c)
  const box: number[] = []
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) box.push((br + dr) * 9 + (bc + dc))
  return { row, col, box }
}
