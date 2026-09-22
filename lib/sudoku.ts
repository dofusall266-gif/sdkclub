export type Grid = number[] // length 81, 0 = empty
export type Difficulty = "facile" | "moyen" | "difficile" | "expert"

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  facile: "Facile",
  moyen: "Moyen",
  difficile: "Difficile",
  expert: "Expert",
}

// Number of clues (given cells) to keep per difficulty.
// Fewer clues = harder puzzle. A valid Sudoku needs at least 17 clues.
const CLUES_BY_DIFFICULTY: Record<Difficulty, number> = {
  facile: 45,
  moyen: 36,
  difficile: 30,
  expert: 24,
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

function canPlace(grid: Grid, index: number, value: number): boolean {
  const r = rowOf(index)
  const c = colOf(index)
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3

  for (let i = 0; i < 9; i++) {
    if (grid[r * 9 + i] === value) return false // row
    if (grid[i * 9 + c] === value) return false // col
  }
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 3; dc++) {
      if (grid[(br + dr) * 9 + (bc + dc)] === value) return false // box
    }
  }
  return true
}

function fillGrid(grid: Grid, random: () => number = Math.random): boolean {
  for (let i = 0; i < 81; i++) {
    if (grid[i] === 0) {
      const values = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random)
      for (const v of values) {
        if (canPlace(grid, i, v)) {
          grid[i] = v
          if (fillGrid(grid, random)) return true
          grid[i] = 0
        }
      }
      return false
    }
  }
  return true
}

// Counts solutions up to a limit (2) to verify uniqueness.
function countSolutions(grid: Grid, limit = 2): number {
  let count = 0

  function solve(): void {
    if (count >= limit) return
    let idx = -1
    for (let i = 0; i < 81; i++) {
      if (grid[i] === 0) {
        idx = i
        break
      }
    }
    if (idx === -1) {
      count++
      return
    }
    for (let v = 1; v <= 9; v++) {
      if (canPlace(grid, idx, v)) {
        grid[idx] = v
        solve()
        grid[idx] = 0
        if (count >= limit) return
      }
    }
  }

  solve()
  return count
}

export function solveGrid(input: Grid): Grid | null {
  const grid = [...input]

  function solve(): boolean {
    let idx = -1
    for (let i = 0; i < 81; i++) {
      if (grid[i] === 0) {
        idx = i
        break
      }
    }
    if (idx === -1) return true
    for (let v = 1; v <= 9; v++) {
      if (canPlace(grid, idx, v)) {
        grid[idx] = v
        if (solve()) return true
        grid[idx] = 0
      }
    }
    return false
  }

  return solve() ? grid : null
}

export interface Puzzle {
  puzzle: Grid // with holes
  solution: Grid // full solution
  difficulty: Difficulty
}

export function generatePuzzle(difficulty: Difficulty, random: () => number = Math.random): Puzzle {
  const solution: Grid = new Array(81).fill(0)
  fillGrid(solution, random)

  const puzzle = [...solution]
  const targetClues = CLUES_BY_DIFFICULTY[difficulty]
  let clues = 81

  // Try removing cells (in symmetric-ish random order) while keeping uniqueness.
  const order = shuffle(Array.from({ length: 81 }, (_, i) => i), random)

  for (const index of order) {
    if (clues <= targetClues) break
    if (puzzle[index] === 0) continue

    const backup = puzzle[index]
    puzzle[index] = 0

    // Ensure the puzzle still has exactly one solution.
    const solutions = countSolutions([...puzzle], 2)
    if (solutions !== 1) {
      puzzle[index] = backup // revert, removing this cell breaks uniqueness
    } else {
      clues--
    }
  }

  return { puzzle, solution, difficulty }
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
