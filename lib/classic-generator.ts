/**
 * GÉNÉRATEUR CLASSIQUE — la méthode d'avant la V16, conservée pour pouvoir y revenir.
 *
 * Il fabrique la grille dans le navigateur : grille complète au hasard, puis retrait des
 * chiffres un par un en gardant une solution unique, jusqu'à un nombre d'indices cible.
 * Limite connue : il garantit une solution unique, mais PAS qu'on puisse la trouver sans
 * deviner, et il ne connaît pas Diabolique ni Fou.
 *
 * Pour l'activer : dans lib/sudoku.ts, mettre GRID_MODE = "classic".
 */

export type ClassicLevel = "facile" | "moyen" | "difficile" | "expert"

export const CLASSIC_CLUES: Record<ClassicLevel, number> = {
  facile: 45,
  moyen: 36,
  difficile: 30,
  expert: 24,
}

function shuffle<T>(arr: T[], random: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function canPlace(grid: number[], index: number, value: number): boolean {
  const r = Math.floor(index / 9)
  const c = index % 9
  const br = Math.floor(r / 3) * 3
  const bc = Math.floor(c / 3) * 3
  for (let i = 0; i < 9; i++) {
    if (grid[r * 9 + i] === value) return false
    if (grid[i * 9 + c] === value) return false
  }
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) if (grid[(br + dr) * 9 + (bc + dc)] === value) return false
  return true
}

function fillGrid(grid: number[], random: () => number): boolean {
  for (let i = 0; i < 81; i++) {
    if (grid[i] === 0) {
      for (const v of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], random)) {
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

function countSolutions(grid: number[], limit = 2): number {
  let count = 0
  function solve(): void {
    if (count >= limit) return
    const idx = grid.indexOf(0)
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

export function generateClassicPuzzle(level: ClassicLevel, random: () => number): { puzzle: number[]; solution: number[] } {
  const solution: number[] = new Array(81).fill(0)
  fillGrid(solution, random)
  const puzzle = [...solution]
  const target = CLASSIC_CLUES[level]
  let clues = 81
  for (const index of shuffle(Array.from({ length: 81 }, (_, i) => i), random)) {
    if (clues <= target) break
    const backup = puzzle[index]
    puzzle[index] = 0
    if (countSolutions([...puzzle], 2) !== 1) puzzle[index] = backup
    else clues--
  }
  return { puzzle, solution }
}
