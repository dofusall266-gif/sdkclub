import fs from "node:fs"
import { logicSolve, rawDifficulty } from "../lib/solver"
const by: Record<string, number[]> = {}
const seen = new Set<string>()
for (const f of process.argv.slice(2)) for (const line of fs.readFileSync(f, "utf8").split("\n")) {
  const p = line.trim().split(" ")
  if (p.length !== 4 || seen.has(p[3])) continue
  seen.add(p[3])
  const res = logicSolve(Array.from(p[3], Number))
  if (!res.solved) continue
  ;(by[res.hardest!] ??= []).push(rawDifficulty(res))
}
for (const [k, v] of Object.entries(by).sort((a, b) => a[1].reduce((x, y) => x + y) / a[1].length - b[1].reduce((x, y) => x + y) / b[1].length)) {
  v.sort((a, b) => a - b)
  console.log(k.padEnd(14), String(v.length).padStart(5), "min/25/med/75/max", [0, 0.25, 0.5, 0.75, 0.999].map((q) => v[Math.floor(q * v.length)].toFixed(0)).join("/"))
}
const all = Object.values(by).flat().sort((a, b) => a - b)
console.log("tous:", all.length, [0.1, 0.25, 0.5, 0.75, 0.9, 0.95, 0.99].map((q) => all[Math.floor(q * all.length)].toFixed(0)).join(" "))
