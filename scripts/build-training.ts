/**
 * Construit lib/training-cases.ts à partir des exercices fabriqués par gen-training.ts.
 * Usage : node build-training.cjs x_wing=fichier.jsonl xy_wing=fichier.jsonl swordfish=fichier.jsonl
 * Le premier exercice de chaque technique sert d'exemple illustré : un seul motif, peu d'éliminations.
 */
import fs from "node:fs"
import type { Pattern } from "../lib/solver"
import { rng, shuffle } from "./bank-tools"

const COUNT: Record<string, number> = { x_wing: 40, xy_wing: 40, swordfish: 30 }
const r = rng(99)

interface Raw { val: number[]; cand: number[]; patterns: Pattern[] }

const compact = (p: Pattern) => ({
  d: p.digit,
  c: p.cells,
  e: p.elims,
  ...(p.pivot !== undefined ? { pv: p.pivot } : {}),
  ...(p.lines ? { l: { k: p.lines.kind === "row" ? "r" : "c", b: p.lines.base, v: p.lines.cover } } : {}),
})

const out: Record<string, unknown[]> = {}
for (const arg of process.argv.slice(2)) {
  const [tech, file] = arg.split("=")
  const seen = new Set<string>()
  const rows: Raw[] = []
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue
    const row = JSON.parse(line) as Raw
    const key = row.val.join("")
    if (seen.has(key)) continue
    seen.add(key)
    rows.push(row)
  }
  const empties = (x: Raw) => x.val.filter((v) => v === 0).length
  // Exemple illustré : un seul motif, 1 à 3 éliminations, grille la plus avancée possible (peu de cases vides).
  const featured = rows
    .filter((x) => x.patterns.length === 1 && x.patterns[0].elims.length >= 1 && x.patterns[0].elims.length <= 3)
    .sort((a, b) => empties(a) - empties(b))[0]
  const pool = shuffle(rows.filter((x) => x !== featured && x.patterns.length <= 2), r)
  const chosen = [featured, ...pool].filter(Boolean).slice(0, COUNT[tech]) as Raw[]
  out[tech] = chosen.map((x) => ({
    v: x.val.join(""),
    c: x.cand.map((m, i) => (x.val[i] !== 0 ? "000" : m.toString(16).padStart(3, "0"))).join(""),
    p: x.patterns.map(compact),
  }))
  console.log(`${tech}: ${rows.length} exercices disponibles, ${chosen.length} retenus (exemple : ${empties(featured)} cases vides)`)
}

let ts = `/**
 * EXERCICES D'ENTRAÎNEMENT — fichier généré par scripts/build-training.ts, ne pas modifier à la main.
 * Chaque exercice est une vraie situation de grille (notes comprises) où la technique s'applique.
 */
import type { TrainingCase, TrainingTech } from "@/lib/training"

export const TRAINING_CASES: Record<TrainingTech, TrainingCase[]> = {\n`
for (const [tech, list] of Object.entries(out)) ts += `  ${tech}: ${JSON.stringify(list)},\n`
ts += "}\n"
fs.writeFileSync("lib/training-cases.ts", ts)
console.log("lib/training-cases.ts écrit,", Math.round(ts.length / 1024), "Ko")
