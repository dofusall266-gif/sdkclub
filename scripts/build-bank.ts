/**
 * Construit lib/puzzle-bank.ts à partir des lots de grilles notées.
 * Usage : node build-bank.cjs <taille par niveau> <fichier de lot>...
 * Chaque grille retenue est revérifiée de zéro : solution unique ET résolution
 * 100 % logique (aucune devinette), puis notée.
 */
import fs from "node:fs"
import { LEVEL_RANGES, logicSolve, rawDifficulty, ratingFromRaw } from "../lib/solver"
import { countSolutions, disguise, rng, shuffle } from "./bank-tools"

const [perLevelArg, ...files] = process.argv.slice(2)
const perLevel = Number(perLevelArg)
const r = rng(4242)

interface Row { puzzle: number[]; clues: number }
const pool: Row[] = []
const seen = new Set<string>()
for (const f of files) {
  for (const line of fs.readFileSync(f, "utf8").split("\n")) {
    const p = line.trim().split(" ")
    if (p.length !== 4 || seen.has(p[3])) continue
    seen.add(p[3])
    pool.push({ puzzle: Array.from(p[3], Number), clues: Number(p[2]) })
  }
}
console.log(`${pool.length} grilles candidates`)

const bank: Record<string, string[]> = {}
const stats: string[] = []
for (const [level, [lo, hi]] of Object.entries(LEVEL_RANGES)) {
  const picked: { rating: number; puzzle: number[] }[] = []
  for (const row of shuffle(pool, r)) {
    if (picked.length >= perLevel) break
    const res = logicSolve(row.puzzle)
    if (!res.solved) continue // ne devrait jamais arriver
    // Stabilité : la note dépend un peu de l'ordre dans lequel le solveur trouve les
    // déductions. On la mesure sur 6 déguisements et on garde la médiane ; une grille
    // dont la note bouge de plus de 5 points est trop instable pour être affichée.
    const samples = [ratingFromRaw(rawDifficulty(res))]
    let unstable = false
    for (let k = 0; k < 6; k++) {
      const v = logicSolve(disguise(row.puzzle, r))
      if (!v.solved) { unstable = true; break }
      samples.push(ratingFromRaw(rawDifficulty(v)))
    }
    if (unstable || Math.max(...samples) - Math.min(...samples) > 5) continue
    samples.sort((a, b) => a - b)
    const rating = samples[Math.floor(samples.length / 2)]
    if (rating < lo || rating > hi) continue
    if (level === "facile" && row.clues < 32) continue // un niveau Facile doit rester généreux en indices (32 minimum)
    if (countSolutions(row.puzzle) !== 1) throw new Error("solution non unique")
    picked.push({ rating, puzzle: row.puzzle })
  }
  picked.sort((a, b) => a.rating - b.rating)
  bank[level] = picked.map((p) => `${p.rating}:${p.puzzle.join("")}`)
  const rs = picked.map((p) => p.rating)
  stats.push(`${level}: ${picked.length} grilles, notes ${rs[0]}–${rs[rs.length - 1]}`)
}
console.log(stats.join("\n"))

let out = `/**
 * BANQUE DE GRILLES — fichier généré par scripts/build-bank.ts, ne pas modifier à la main.
 * Chaque entrée = « note:81 chiffres » (0 = case vide). Toutes les grilles ont une
 * solution unique et se résolvent par pure logique (aucune devinette) ; la note
 * (1-100) vient du solveur logique (lib/solver.ts).
 */
export const PUZZLE_BANK: Record<"facile" | "moyen" | "difficile" | "expert" | "diabolique" | "fou", string[]> = {\n`
for (const [level, list] of Object.entries(bank)) {
  out += `  ${level}: [\n${list.map((e) => `    "${e}",`).join("\n")}\n  ],\n`
}
out += "}\n"
fs.writeFileSync("lib/puzzle-bank.ts", out)
console.log("lib/puzzle-bank.ts écrit,", Math.round(out.length / 1024), "Ko")
