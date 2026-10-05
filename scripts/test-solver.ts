import { logicSolve, TECHNIQUES } from "../lib/solver"
import { countSolutions, dig, randomSolution, rng } from "./bank-tools"

const r = rng(12345)
const totals: Record<string, number> = {}
let n = 0, solvedAll = 0, t0 = Date.now()
for (let k = 0; k < 40; k++) {
  const sol = randomSolution(r)
  const puzzle = dig(sol, r, "jellyfish", 20)
  const res = logicSolve(puzzle, "jellyfish", sol) // lève une erreur si une technique est fausse
  if (countSolutions(puzzle) !== 1) throw new Error("solution non unique !")
  if (res.solved && res.solution!.join("") !== sol.join("")) throw new Error("mauvaise solution")
  n++
  if (res.solved) solvedAll++
  for (const t of TECHNIQUES) totals[t] = (totals[t] ?? 0) + (res.uses[t] > 0 ? 1 : 0)
}
console.log(`${n} grilles, toutes résolues par logique: ${solvedAll}, ${Date.now() - t0} ms`)
console.log("grilles utilisant chaque technique:", totals)
