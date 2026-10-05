import { logicSolve, type Technique } from "../lib/solver"
import { dig, randomSolution, rng } from "./bank-tools"

const r = rng(2026)
const tiers: [Technique, number][] = [
  ["hidden_single", 30],
  ["claiming", 26],
  ["hidden_triple", 22],
  ["swordfish", 20],
  ["jellyfish", 20],
]
const q = (a: number[], p: number) => a[Math.min(a.length - 1, Math.floor(p * a.length))]
for (const [tech, minClues] of tiers) {
  const scores: number[] = []
  const clues: number[] = []
  const hard: Record<string, number> = {}
  const t0 = Date.now()
  for (let k = 0; k < 80; k++) {
    const sol = randomSolution(r)
    const p = dig(sol, r, tech, minClues)
    const res = logicSolve(p, tech)
    scores.push(res.score)
    clues.push(p.filter(Boolean).length)
    hard[res.hardest!] = (hard[res.hardest!] ?? 0) + 1
  }
  scores.sort((a, b) => a - b)
  console.log(tech, `${Date.now() - t0}ms`, "clues~", Math.round(clues.reduce((a, b) => a + b) / clues.length),
    "score min/25/50/75/90/max:", [0, 0.25, 0.5, 0.75, 0.9, 0.999].map((p) => q(scores, p)).join("/"), JSON.stringify(hard))
}
