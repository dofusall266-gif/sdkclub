/** Fabrique des grilles « naturelles » pour UN niveau : node gen-level.cjs <niveau> <graine> <secondes> <fichier> */
import fs from "node:fs"
import { LEVEL_RANGES, logicSolve, rawDifficulty, ratingFromRaw, type Technique } from "../lib/solver"
import { digTarget, randomSolution, rng } from "./bank-tools"

export const LEVEL_PARAMS: Record<string, { tech: Technique; clues: [number, number]; symmetric: boolean; minPerBox: number }> = {
  facile: { tech: "hidden_single", clues: [38, 46], symmetric: true, minPerBox: 3 },
  moyen: { tech: "hidden_pair", clues: [32, 38], symmetric: true, minPerBox: 2 },
  difficile: { tech: "hidden_triple", clues: [26, 32], symmetric: true, minPerBox: 2 },
  expert: { tech: "swordfish", clues: [25, 28], symmetric: true, minPerBox: 1 },
  diabolique: { tech: "jellyfish", clues: [24, 27], symmetric: false, minPerBox: 1 },
  fou: { tech: "jellyfish", clues: [22, 26], symmetric: false, minPerBox: 1 },
}

const [level, seedArg, secArg, outFile] = process.argv.slice(2)
const P = LEVEL_PARAMS[level]
const [lo, hi] = LEVEL_RANGES[level as keyof typeof LEVEL_RANGES]
const r = rng(Number(seedArg))
const deadline = Date.now() + Number(secArg) * 1000
let tried = 0, kept = 0
while (Date.now() < deadline) {
  tried++
  const target = P.clues[0] + Math.floor(r() * (P.clues[1] - P.clues[0] + 1))
  const sol = randomSolution(r)
  const puzzle = digTarget(sol, r, P.tech, target, P.symmetric, P.minPerBox)
  const clues = puzzle.filter(Boolean).length
  if (clues > P.clues[1] + 1) continue
  const res = logicSolve(puzzle)
  if (!res.solved) continue
  const rating = ratingFromRaw(rawDifficulty(res))
  if (rating < lo || rating > hi) continue
  kept++
  fs.appendFileSync(outFile, `${rating} ${res.hardest} ${clues} ${puzzle.join("")}\n`)
}
console.log(`${level}: ${kept} retenues sur ${tried} essais`)
