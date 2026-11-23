"use client"

import { Check, X } from "lucide-react"
import { useState } from "react"

import { useLanguage } from "@/lib/i18n/context"
import { zoneOf } from "@/lib/training"
import { cn } from "@/lib/utils"

/**
 * Schémas pédagogiques du Y-Wing : le pivot, la zone qu'il « voit », les deux ailes, puis l'élimination.
 * Chaque schéma se lit en lettres (A, B, C) ou avec de vrais chiffres. Les cases sont repérées comme sur le reste du site (L7C4 = ligne 7, colonne 4).
 */

type Kind = "pivot" | "wing" | "elim"
interface Token {
  text: string
  struck?: boolean
}
interface CellSpec {
  kind: Kind
  tokens: Token[]
}

const cell = (r: number, c: number) => r * 9 + c

// Exemple valide : pivot en L9C5 (2 4), ailes L7C4 (2 5) et L9C1 (4 5), élimination du 5 en L7C1.
const PIVOT = cell(8, 4)
const WING_A = cell(6, 3)
const WING_B = cell(8, 0)
const ELIM = cell(6, 0)
// Contre-exemple : mêmes pivot et chiffres, mais les ailes L7C1 et L8C7 sont hors de la zone du pivot.
const BAD_WING_1 = cell(6, 0)
const BAD_WING_2 = cell(7, 6)

const DIGITS = { A: "2", B: "4", C: "5" } as const
type Mode = "letters" | "digits"

const TEXT = {
  fr: {
    heading: "Comprendre le Y-Wing en schémas",
    intro:
      "Un Y-Wing utilise trois cases qui n'ont chacune que deux candidats : un pivot AB et deux ailes AC et BC. L'idée clé : les deux ailes doivent être « vues » par le pivot, c'est-à-dire dans sa ligne, sa colonne ou son bloc.",
    letters: "Lettres : A B C",
    digits: "Chiffres : 2 4 5",
    row: "L",
    steps: ["1. Le pivot", "2. Les ailes", "3. L'élimination"],
    legendPivot: "pivot",
    legendZone: "zone vue par le pivot",
    legendWings: "ailes",
    legendElim: "élimination",
    badHeading: "À éviter : des ailes que le pivot ne voit pas",
    badText: (p: string) =>
      `Ici le pivot ${p} (2 4) a bien deux ailes en 4 5 et 2 5, mais elles sont en dehors de sa zone bleue : ni dans sa ligne, ni dans sa colonne, ni dans son bloc. Le pivot ne les « voit » pas, donc le raisonnement ne marche plus et on ne peut rien éliminer.`,
    ok: "Valide : les deux ailes sont dans la zone du pivot",
    ko: "Invalide : les ailes sont hors de la zone du pivot",
    seeTitle: "Que veut dire « voir » ?",
    seeText:
      "Deux cases se voient quand elles sont dans la même ligne, la même colonne ou le même bloc de 3×3. La zone d'une case, c'est l'ensemble de toutes les cases qu'elle voit.",
    stepTitle: ["Le pivot et sa zone", "Les deux ailes, dans la zone", "On élimine C"],
    step: (n: number, s: (k: "A" | "B" | "C") => string) =>
      [
        `Le pivot est la case à deux candidats ${s("A")} et ${s("B")}. Il « voit » toutes les cases de sa ligne, de sa colonne et de son bloc : c'est sa zone, en bleu.`,
        `Les ailes doivent se trouver dans la zone bleue. L'une contient ${s("A")} et ${s("C")}, l'autre ${s("B")} et ${s("C")}. Ici, L7C4 est dans le bloc du pivot et L9C1 dans sa ligne.`,
        `Si le pivot vaut ${s("A")}, l'aile ${s("A")}${s("C")} vaut ${s("C")}. S'il vaut ${s("B")}, l'aile ${s("B")}${s("C")} vaut ${s("C")}. Dans les deux cas, une aile vaut ${s("C")} : on retire ${s("C")} des cases qui voient les deux ailes. Ici L7C1 voit l'une (même ligne) et l'autre (même colonne) : son ${s("C")} est barré en rouge.`,
      ][n],
    aria: "Schéma d'une grille de sudoku illustrant le Y-Wing",
  },
  en: {
    heading: "Understand the Y-Wing with diagrams",
    intro:
      "A Y-Wing uses three cells that each hold only two candidates: a pivot AB and two wings AC and BC. The key idea: both wings must be “seen” by the pivot, meaning they sit in its row, its column or its box.",
    letters: "Letters: A B C",
    digits: "Digits: 2 4 5",
    row: "R",
    steps: ["1. The pivot", "2. The wings", "3. Elimination"],
    legendPivot: "pivot",
    legendZone: "zone seen by the pivot",
    legendWings: "wings",
    legendElim: "elimination",
    badHeading: "Avoid this: wings the pivot cannot see",
    badText: (p: string) =>
      `Here the pivot ${p} (2 4) does have wings holding 4 5 and 2 5, but they sit outside its blue zone: not in its row, its column or its box. The pivot cannot “see” them, so the reasoning breaks down and nothing can be eliminated.`,
    ok: "Valid: both wings are inside the pivot's zone",
    ko: "Invalid: the wings are outside the pivot's zone",
    seeTitle: "What does “seeing” mean?",
    seeText:
      "Two cells see each other when they share a row, a column or a 3×3 box. A cell's zone is the set of all the cells it sees.",
    stepTitle: ["The pivot and its zone", "The two wings, inside the zone", "We eliminate C"],
    step: (n: number, s: (k: "A" | "B" | "C") => string) =>
      [
        `The pivot is the two-candidate cell ${s("A")} and ${s("B")}. It “sees” every cell in its row, its column and its box: that is its zone, in blue.`,
        `The wings must sit inside the blue zone. One holds ${s("A")} and ${s("C")}, the other ${s("B")} and ${s("C")}. Here, R7C4 is in the pivot's box and R9C1 in its row.`,
        `If the pivot is ${s("A")}, the ${s("A")}${s("C")} wing is ${s("C")}. If it is ${s("B")}, the ${s("B")}${s("C")} wing is ${s("C")}. Either way, one wing is ${s("C")}: we remove ${s("C")} from cells that see both wings. Here R7C1 sees one (same row) and the other (same column): its ${s("C")} is crossed out in red.`,
      ][n],
    aria: "Sudoku grid diagram illustrating the Y-Wing",
  },
} as const

const KIND_STYLE: Record<Kind, string> = {
  pivot: "bg-amber-500/30 text-amber-700 ring-2 ring-inset ring-amber-500 dark:text-amber-300",
  wing: "bg-primary/20 text-primary ring-2 ring-inset ring-primary",
  elim: "bg-destructive/15 text-foreground ring-2 ring-inset ring-destructive",
}

/** Grille 9×9 avec repères, zone bleue et cases mises en valeur. Purement visuelle. */
function DiagramGrid({ zone, cells, label, rowLetter }: { zone: Set<number>; cells: Map<number, CellSpec>; label: string; rowLetter: string }) {
  return (
    <div className="w-full max-w-[30rem]" role="img" aria-label={label}>
      <div className="grid grid-cols-[1.5rem_minmax(0,1fr)] gap-x-1 gap-y-1 sm:grid-cols-[1.75rem_minmax(0,1fr)]">
        <span aria-hidden />
        <div className="grid grid-cols-9" aria-hidden>
          {Array.from({ length: 9 }, (_, c) => (
            <span key={c} className="text-center text-[0.65rem] font-semibold text-muted-foreground sm:text-xs">
              C{c + 1}
            </span>
          ))}
        </div>
        <div className="grid grid-rows-9" aria-hidden>
          {Array.from({ length: 9 }, (_, r) => (
            <span key={r} className="grid place-items-center text-[0.65rem] font-semibold text-muted-foreground sm:text-xs">
              {rowLetter}
              {r + 1}
            </span>
          ))}
        </div>
        <div className="grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-xl border-2 border-foreground/70 bg-card shadow-sm">
          {Array.from({ length: 81 }, (_, i) => {
            const r = Math.floor(i / 9)
            const c = i % 9
            const spec = cells.get(i)
            return (
              <div
                key={i}
                className={cn(
                  "relative flex min-h-0 min-w-0 items-center justify-center border-b border-r border-border transition-colors duration-300",
                  c % 3 === 2 && c !== 8 && "border-r-2 border-r-foreground/40",
                  r % 3 === 2 && r !== 8 && "border-b-2 border-b-foreground/40",
                  c === 8 && "border-r-0",
                  r === 8 && "border-b-0",
                  zone.has(i) && "bg-sky-500/15 dark:bg-sky-400/15",
                  spec && KIND_STYLE[spec.kind],
                )}
              >
                {spec && (
                  <span className="flex gap-[0.2em] text-[0.7rem] font-bold leading-none tracking-wide sm:text-base">
                    {spec.tokens.map((tk, k) => (
                      <span key={k} className={cn(tk.struck && "text-destructive line-through decoration-2")}>
                        {tk.text}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function Legend({ x, withElim }: { x: (typeof TEXT)["fr"] | (typeof TEXT)["en"]; withElim: boolean }) {
  const item = (cls: string, text: string) => (
    <li className="flex items-center gap-2">
      <span className={cn("size-4 rounded", cls)} />
      {text}
    </li>
  )
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
      {item("bg-sky-500/25 ring-1 ring-sky-500/60", x.legendZone)}
      {item("bg-amber-500/30 ring-2 ring-amber-500", x.legendPivot)}
      {item("bg-primary/20 ring-2 ring-primary", x.legendWings)}
      {withElim && item("bg-destructive/15 ring-2 ring-destructive", x.legendElim)}
    </ul>
  )
}

export function YWingExplainer() {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const [mode, setMode] = useState<Mode>("letters")
  const [step, setStep] = useState(0)

  const sym = (k: "A" | "B" | "C") => (mode === "letters" ? k : DIGITS[k])
  const tok = (...ks: ("A" | "B" | "C")[]): Token[] => ks.map((k) => ({ text: sym(k) }))
  const r = (n: number) => `${x.row}${n}`
  const pivotName = `${r(9)}C5`

  // Schéma valide, construit étape par étape.
  const cells = new Map<number, CellSpec>()
  cells.set(PIVOT, { kind: "pivot", tokens: tok("A", "B") })
  if (step >= 1) {
    cells.set(WING_A, { kind: "wing", tokens: tok("A", "C") })
    cells.set(WING_B, { kind: "wing", tokens: tok("B", "C") })
  }
  if (step >= 2) cells.set(ELIM, { kind: "elim", tokens: [{ text: sym("B") }, { text: sym("C"), struck: true }] })
  const zone = zoneOf(PIVOT)

  // Contre-exemple : les ailes ne sont pas dans la zone.
  const badCells = new Map<number, CellSpec>([
    [PIVOT, { kind: "pivot", tokens: [{ text: "2" }, { text: "4" }] }],
    [BAD_WING_1, { kind: "wing", tokens: [{ text: "4" }, { text: "5" }] }],
    [BAD_WING_2, { kind: "wing", tokens: [{ text: "2" }, { text: "5" }] }],
  ])

  const seg = (active: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
      active ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
    )

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{x.heading}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{x.intro}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="mb-5 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-sm">
          <p className="font-semibold">{x.seeTitle}</p>
          <p className="mt-1 text-muted-foreground">{x.seeText}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,30rem)_1fr]">
          <div>
            <DiagramGrid zone={zone} cells={cells} label={x.aria} rowLetter={x.row} />
            <Legend x={x} withElim={step >= 2} />
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2" role="group">
              <button type="button" className={seg(mode === "letters")} aria-pressed={mode === "letters"} onClick={() => setMode("letters")}>
                {x.letters}
              </button>
              <button type="button" className={seg(mode === "digits")} aria-pressed={mode === "digits"} onClick={() => setMode("digits")}>
                {x.digits}
              </button>
            </div>

            <div className="flex flex-wrap gap-2" role="tablist">
              {x.steps.map((label, i) => (
                <button key={label} type="button" role="tab" aria-selected={step === i} className={seg(step === i)} onClick={() => setStep(i)}>
                  {label}
                </button>
              ))}
            </div>

            <div className="rounded-xl border border-border bg-secondary/40 p-4" aria-live="polite">
              <p className="font-semibold">{x.stepTitle[step]}</p>
              <p className="mt-1 text-sm leading-relaxed">{x.step(step, sym)}</p>
            </div>

            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <Check className="size-4" />
              {x.ok}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:p-6">
        <h3 className="flex items-center gap-2 font-semibold text-destructive">
          <X className="size-5" />
          {x.badHeading}
        </h3>
        <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,30rem)_1fr]">
          <div>
            <DiagramGrid zone={zone} cells={badCells} label={x.aria} rowLetter={x.row} />
            <Legend x={x} withElim={false} />
          </div>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{x.badText(pivotName)}</p>
            <p className="flex items-center gap-2 text-sm font-medium text-destructive">
              <X className="size-4" />
              {x.ko}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
