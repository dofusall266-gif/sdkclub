import { logicSolve, TECHNIQUES, type Technique } from "../lib/solver"
import { dig, randomSolution, rng } from "./bank-tools"

const r = rng(777)
const totals: Record<string, number> = {}
const skipSets: Technique[][] = [
  [],
  ["xy_chain"],
  ["xy_chain", "turbot"],
  ["xy_chain", "turbot", "xy_wing"],
  ["xy_chain", "turbot", "xy_wing", "x_wing"],
  ["xy_chain", "turbot", "xy_wing", "xyz_wing", "x_wing", "swordfish"],
  ["xy_chain", "turbot", "xy_wing", "xyz_wing", "x_wing", "swordfish", "naked_pair", "naked_triple"],
]
let runs = 0
for (let k = 0; k < 60; k++) {
  const sol = randomSolution(r)
  const puzzle = dig(sol, r, "jellyfish", 20)
  for (const sk of skipSets) {
    const res = logicSolve(puzzle, "jellyfish", sol, new Set(sk)) // lève une erreur si faux
    runs++
    for (const t of TECHNIQUES) totals[t] = (totals[t] ?? 0) + res.uses[t]
    if (res.solved && res.solution!.join("") !== sol.join("")) throw new Error("mauvaise solution")
  }
}
console.log(runs, "résolutions vérifiées. Utilisations cumulées:", totals)
