import { generatePuzzle, createSeededRandom, DIFFICULTIES, findConflicts } from "../lib/sudoku"
import { logicSolve, rawDifficulty, ratingFromRaw, LEVEL_RANGES } from "../lib/solver"
import { countSolutions } from "./bank-tools"

let checked = 0
let drift = 0
for (const level of DIFFICULTIES) {
  const [lo, hi] = LEVEL_RANGES[level]
  const ratings: number[] = []
  for (let k = 0; k < 40; k++) {
    const p = generatePuzzle(level, createSeededRandom(1000 + k * 7919))
    // 1) la solution est complète, valide et cohérente avec les indices
    if (p.solution.some((v) => v === 0) || findConflicts(p.solution).size) throw new Error("solution invalide")
    p.puzzle.forEach((v, i) => { if (v && v !== p.solution[i]) throw new Error("indice faux") })
    // 2) la grille déguisée est toujours résoluble sans deviner, et sa note n'a pas bougé
    const res = logicSolve(p.puzzle)
    if (!res.solved) throw new Error(`${level}: grille déguisée non résolue par logique`)
    const rating = ratingFromRaw(rawDifficulty(res))
    drift = Math.max(drift, Math.abs(rating - p.rating))
    if (Math.abs(rating - p.rating) > 4) throw new Error(`${level}: note ${rating} != ${p.rating}`)
    if (p.rating < lo || p.rating > hi) throw new Error(`${level}: note hors tranche`)
    if (k < 8 && countSolutions(p.puzzle) !== 1) throw new Error("solution non unique")
    ratings.push(rating)
    checked++
  }
  // 3) déterminisme (défi du jour) : même graine = même grille
  const a = generatePuzzle(level, createSeededRandom(42)), b = generatePuzzle(level, createSeededRandom(42))
  if (a.puzzle.join("") !== b.puzzle.join("")) throw new Error("non déterministe")
  console.log(level.padEnd(11), "notes vues:", Math.min(...ratings), "–", Math.max(...ratings))
}
console.log(checked, "grilles déguisées vérifiées (solution, logique pure, déterminisme). Écart max de note après déguisement:", drift)
