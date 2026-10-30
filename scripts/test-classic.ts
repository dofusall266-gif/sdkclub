import { generateClassicPuzzle } from "../lib/classic-generator"
import { createSeededRandom, findConflicts } from "../lib/sudoku"
for (const lvl of ["facile", "moyen", "difficile", "expert"] as const) {
  const t0 = Date.now()
  const { puzzle, solution } = generateClassicPuzzle(lvl, createSeededRandom(5))
  if (findConflicts(solution).size || solution.includes(0)) throw new Error("solution invalide")
  console.log(lvl, "indices", puzzle.filter(Boolean).length, `${Date.now() - t0} ms`)
}
