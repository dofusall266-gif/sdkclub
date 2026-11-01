import { renderToStaticMarkup } from "react-dom/server"
import { TrainingBoard } from "../components/training/training-board"
import { TRAINING_CASES } from "../lib/training-cases"
import { checkSelection, decodeCase, explainPattern, type TrainingTech } from "../lib/training"

let n = 0
for (const tech of Object.keys(TRAINING_CASES) as TrainingTech[]) {
  for (const tc of TRAINING_CASES[tech]) {
    const dc = decodeCase(tc)
    if (dc.patterns.length === 0) throw new Error(`${tech}: cas sans motif`)
    for (const p of dc.patterns) {
      if (p.e.length === 0) throw new Error("motif sans élimination")
      for (const i of p.e) if (!dc.candidates[i].includes(p.d)) throw new Error("élimination d'un candidat absent")
      for (const i of p.c) if (dc.values[i] !== 0) throw new Error("case de motif déjà posée")
      const exact = checkSelection(new Set(p.c), dc.patterns)
      if (exact.matched < 0) throw new Error("sélection exacte refusée")
      const missing = checkSelection(new Set(p.c.slice(1)), dc.patterns)
      if (missing.matched >= 0 && dc.patterns.every((q) => q.c.length !== p.c.length - 1)) throw new Error("sélection incomplète acceptée")
      for (const loc of ["fr", "en"] as const) if (explainPattern(tech, p, dc, loc).length < 50) throw new Error("explication vide")
    }
    const html = renderToStaticMarkup(<TrainingBoard dc={dc} reveal={dc.patterns[0]} focusDigits={[dc.patterns[0].d]} readOnly />)
    if (!html.includes("line-through")) throw new Error("candidat éliminé non affiché")
    n++
  }
}
console.log(n, "exercices vérifiés (motif valide, validation exacte, explications FR/EN, rendu de la grille)")
console.log(Object.entries(TRAINING_CASES).map(([k, v]) => `${k}: ${v.length}`).join(", "))
