/** Fabrique un grand lot de grilles notées : `node gen-pool.cjs <graine> <secondes> <fichier>`. */
import fs from "node:fs"
import { logicSolve, rawDifficulty, type Technique } from "../lib/solver"
import { dig, randomSolution, rng } from "./bank-tools"

const [seedArg, secArg, outFile, onlyHard] = process.argv.slice(2)
const r = rng(Number(seedArg))
const deadline = Date.now() + Number(secArg) * 1000

const sources: { tech: Technique; lo: number; hi: number; w: number }[] = [
  { tech: "hidden_single", lo: 32, hi: 42, w: 1 },
  { tech: "claiming", lo: 28, hi: 36, w: 1 },
  { tech: "hidden_triple", lo: 24, hi: 32, w: 1 },
  { tech: "swordfish", lo: 17, hi: 24, w: 2 },
  { tech: "jellyfish", lo: 17, hi: 24, w: 5 },
]
if (onlyHard) sources.splice(0, sources.length - 1) // mode « grilles très dures » : uniquement la boîte à outils complète
const total = sources.reduce((a, s) => a + s.w, 0)
let n = 0
while (Date.now() < deadline) {
  let pick = r() * total
  const src = sources.find((s) => (pick -= s.w) < 0) ?? sources[0]
  const clues = src.lo + Math.floor(r() * (src.hi - src.lo + 1))
  const sol = randomSolution(r)
  const puzzle = dig(sol, r, src.tech, clues)
  const res = logicSolve(puzzle, "jellyfish")
  if (!res.solved) continue
  if (onlyHard && rawDifficulty(res) < 500) continue
  fs.appendFileSync(outFile, `${rawDifficulty(res).toFixed(1)} ${res.hardest} ${puzzle.filter(Boolean).length} ${puzzle.join("")}\n`)
  n++
}
console.log(`graine ${seedArg}: ${n} grilles`)
