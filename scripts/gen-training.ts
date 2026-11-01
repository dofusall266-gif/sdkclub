/** Fabrique les exercices d'entraînement : node gen-training.cjs <technique> <graine> <secondes> <fichier.jsonl> */
import fs from "node:fs"
import { captureState, logicSolve, type Technique, type TrainingTechnique } from "../lib/solver"
import { dig, randomSolution, rng } from "./bank-tools"

const [techArg, seedArg, secArg, outFile] = process.argv.slice(2)
const tech = techArg as TrainingTechnique

// Pour que le motif demandé soit vraiment « la » technique à trouver, on écarte les autres techniques avancées.
const SKIP: Record<TrainingTechnique, Technique[]> = {
  x_wing: ["xy_wing", "turbot", "xyz_wing", "swordfish", "xy_chain", "jellyfish"],
  xy_wing: ["x_wing", "turbot", "xyz_wing", "swordfish", "xy_chain", "jellyfish"],
  swordfish: ["x_wing", "xy_wing", "turbot", "xyz_wing", "xy_chain", "jellyfish"],
}
const DIG_TIER: Record<TrainingTechnique, Technique> = { x_wing: "x_wing", xy_wing: "xy_wing", swordfish: "swordfish" }

const r = rng(Number(seedArg))
const deadline = Date.now() + Number(secArg) * 1000
let tried = 0, kept = 0
while (Date.now() < deadline) {
  tried++
  const sol = randomSolution(r)
  const puzzle = dig(sol, r, DIG_TIER[tech], 22 + Math.floor(r() * 5))
  const st = captureState(puzzle, tech, new Set(SKIP[tech]))
  if (!st) continue
  // Sécurité : aucun candidat éliminé ne doit être le bon chiffre.
  const ok = st.patterns.every((p) => p.elims.every((i) => sol[i] !== p.digit))
  if (!ok) throw new Error("motif faux !")
  // Exercices lisibles : un nombre raisonnable de motifs valides et de cases vides
  if (st.patterns.length > 3) continue
  const empties = st.val.filter((v) => v === 0).length
  if (empties > 60) continue
  kept++
  fs.appendFileSync(outFile, JSON.stringify({ val: st.val, cand: st.cand, patterns: st.patterns, solved: logicSolve(puzzle).solved }) + "\n")
}
console.log(`${tech}: ${kept} exercices sur ${tried} grilles`)
