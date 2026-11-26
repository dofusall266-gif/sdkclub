"use client"

import { Check, X } from "lucide-react"

import { useLanguage } from "@/lib/i18n/context"
import { zoneOf } from "@/lib/training"
import { cn } from "@/lib/utils"

/**
 * Schémas pédagogiques du Y-Wing (statiques) : le pivot AB, sa zone, les ailes AC et BC, puis pourquoi on peut éliminer C.
 * Les cases sont repérées comme sur le reste du site (L7C4 = ligne 7, colonne 4).
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
interface Link {
  from: number
  to: number
  /** Texte posé près du trait (ex. « même ligne »). */
  label?: string
  /** Décalage du texte, en cases (1 case = 10 unités). */
  dx?: number
  dy?: number
}

const cell = (r: number, c: number) => r * 9 + c

// Exemple valide : pivot en L9C5 (A B), ailes L7C4 (A C) et L9C1 (B C), élimination du C en L7C1.
const PIVOT = cell(8, 4)
const WING_A = cell(6, 3)
const WING_B = cell(8, 0)
const ELIM = cell(6, 0)
// Contre-exemple : mêmes pivot et chiffres, mais les ailes L7C1 et L8C7 sont hors de la zone du pivot.
const BAD_WING_1 = cell(6, 0)
const BAD_WING_2 = cell(7, 6)

const T = (text: string, struck = false): Token => ({ text, struck })

const TEXT = {
  fr: {
    heading: "Comprendre le Y-Wing en schéma",
    intro:
      "Un Y-Wing utilise trois cases qui n'ont chacune que deux candidats : un pivot AB et deux ailes AC et BC. L'idée clé : les deux ailes doivent être « vues » par le pivot, c'est-à-dire dans sa ligne, sa colonne ou son bloc.",
    seeTitle: "Que veut dire « voir » ?",
    seeText:
      "Deux cases se voient quand elles sont dans la même ligne, la même colonne ou le même bloc de 3×3. La zone d'une case, c'est l'ensemble de toutes les cases qu'elle voit.",
    row: "L",
    legendPivot: "pivot",
    legendZone: "zone vue par le pivot",
    legendWings: "ailes",
    legendElim: "élimination",
    readTitle: "Comment lire le schéma",
    read: [
      "**Pivot (AB)** : la case à deux candidats A et B. Elle voit sa ligne, sa colonne et son bloc : c'est sa zone, en bleu.",
      "**Aile AC** : dans la zone du pivot (ici, dans son bloc).",
      "**Aile BC** : dans la zone du pivot (ici, dans sa ligne).",
      "**Case rouge** : elle contient C et voit les deux ailes (l'une dans sa ligne, l'autre dans sa colonne). C'est là qu'on va éliminer C.",
    ],
    whyTitle: "Pourquoi peut-on éliminer C ?",
    whyIntro: "On ne sait pas si le pivot vaut A ou B. Regardons les deux cas possibles :",
    case1Title: "Cas 1 : le pivot vaut A",
    case1: "L'aile AC voit le pivot : elle ne peut plus valoir A, donc elle vaut C. Ce C est dans la ligne de la case rouge.",
    case2Title: "Cas 2 : le pivot vaut B",
    case2: "L'aile BC voit le pivot : elle ne peut plus valoir B, donc elle vaut C. Ce C est dans la colonne de la case rouge.",
    sameRow: "même ligne",
    sameCol: "même colonne",
    conclTitle: "Conclusion",
    concl:
      "Dans les deux cas, un C est placé dans une des deux ailes. La case rouge voit les deux ailes : elle voit donc toujours ce C, dans sa ligne ou dans sa colonne. Elle ne peut pas contenir C : on le barre, sans avoir besoin de savoir quel cas est le bon.",
    badHeading: "À éviter : des ailes que le pivot ne voit pas",
    badText: (p: string) =>
      `Ici le pivot ${p} (2 4) a bien deux ailes en 4 5 et 2 5, mais elles sont en dehors de sa zone bleue : ni dans sa ligne, ni dans sa colonne, ni dans son bloc. Le pivot ne les « voit » pas, donc le raisonnement ne marche plus et on ne peut rien éliminer.`,
    ok: "Valide : les deux ailes sont dans la zone du pivot",
    ko: "Invalide : les ailes sont hors de la zone du pivot",
    aria: "Schéma d'une grille de sudoku illustrant le Y-Wing",
  },
  en: {
    heading: "Understand the Y-Wing with a diagram",
    intro:
      "A Y-Wing uses three cells that each hold only two candidates: a pivot AB and two wings AC and BC. The key idea: both wings must be “seen” by the pivot, meaning they sit in its row, its column or its box.",
    seeTitle: "What does “seeing” mean?",
    seeText:
      "Two cells see each other when they share a row, a column or a 3×3 box. A cell's zone is the set of all the cells it sees.",
    row: "R",
    legendPivot: "pivot",
    legendZone: "zone seen by the pivot",
    legendWings: "wings",
    legendElim: "elimination",
    readTitle: "How to read the diagram",
    read: [
      "**Pivot (AB)**: the two-candidate cell holding A and B. It sees its row, column and box: that is its zone, in blue.",
      "**Wing AC**: inside the pivot's zone (here, in its box).",
      "**Wing BC**: inside the pivot's zone (here, in its row).",
      "**Red cell**: it holds C and sees both wings (one in its row, the other in its column). This is where C gets eliminated.",
    ],
    whyTitle: "Why can we eliminate C?",
    whyIntro: "We do not know whether the pivot is A or B. Let's look at both possible cases:",
    case1Title: "Case 1: the pivot is A",
    case1: "Wing AC sees the pivot: it can no longer be A, so it is C. That C is in the red cell's row.",
    case2Title: "Case 2: the pivot is B",
    case2: "Wing BC sees the pivot: it can no longer be B, so it is C. That C is in the red cell's column.",
    sameRow: "same row",
    sameCol: "same column",
    conclTitle: "Conclusion",
    concl:
      "In both cases, a C lands in one of the two wings. The red cell sees both wings: it therefore always sees that C, in its row or in its column. It cannot hold C: we cross it out, without needing to know which case is the real one.",
    badHeading: "Avoid this: wings the pivot cannot see",
    badText: (p: string) =>
      `Here the pivot ${p} (2 4) does have wings holding 4 5 and 2 5, but they sit outside its blue zone: not in its row, its column or its box. The pivot cannot “see” them, so the reasoning breaks down and nothing can be eliminated.`,
    ok: "Valid: both wings are inside the pivot's zone",
    ko: "Invalid: the wings are outside the pivot's zone",
    aria: "Sudoku grid diagram illustrating the Y-Wing",
  },
} as const

const KIND_STYLE: Record<Kind, string> = {
  pivot: "bg-amber-500/30 text-amber-700 ring-2 ring-inset ring-amber-500 dark:text-amber-300",
  wing: "bg-primary/20 text-primary ring-2 ring-inset ring-primary",
  elim: "bg-destructive/15 text-foreground ring-2 ring-inset ring-destructive",
}

/** Transforme « **gras** » en <strong> (les textes de la liste y recourent). */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-foreground">
            {part}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

/** Grille 9×9 avec zone bleue, cases mises en valeur et traits « voit » (pointillés rouges). Purement visuelle. */
function DiagramGrid({
  zone,
  cells,
  links = [],
  label,
  rowLetter,
  compact,
}: {
  zone: Set<number>
  cells: Map<number, CellSpec>
  links?: Link[]
  label: string
  rowLetter: string
  compact?: boolean
}) {
  const center = (i: number) => ({ x: (i % 9) * 10 + 5, y: Math.floor(i / 9) * 10 + 5 })
  const board = (
    <div className="relative grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-xl border-2 border-foreground/70 bg-card shadow-sm">
      {Array.from({ length: 81 }, (_, i) => {
        const r = Math.floor(i / 9)
        const c = i % 9
        const spec = cells.get(i)
        return (
          <div
            key={i}
            className={cn(
              "relative flex min-h-0 min-w-0 items-center justify-center border-b border-r border-border",
              c % 3 === 2 && c !== 8 && "border-r-2 border-r-foreground/40",
              r % 3 === 2 && r !== 8 && "border-b-2 border-b-foreground/40",
              c === 8 && "border-r-0",
              r === 8 && "border-b-0",
              zone.has(i) && "bg-sky-500/15 dark:bg-sky-400/15",
              spec && KIND_STYLE[spec.kind],
            )}
          >
            {spec && (
              <span className={cn("flex gap-[0.2em] font-bold leading-none tracking-wide", compact ? "text-[0.5rem] sm:text-[0.65rem]" : "text-[0.7rem] sm:text-base")}>
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
      {links.length > 0 && (
        <svg viewBox="0 0 90 90" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {links.map((l, k) => {
            const a = center(l.from)
            const b = center(l.to)
            return (
              <g key={k}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  className="stroke-destructive"
                  strokeWidth={compact ? 1.6 : 1.2}
                  strokeDasharray="2.4 1.8"
                  strokeLinecap="round"
                />
                {l.label && !compact && (
                  <text
                    x={(a.x + b.x) / 2 + (l.dx ?? 0) * 10}
                    y={(a.y + b.y) / 2 + (l.dy ?? 0) * 10}
                    textAnchor="middle"
                    className="fill-destructive font-semibold"
                    style={{ fontSize: 2.8, paintOrder: "stroke", stroke: "var(--card)", strokeWidth: 0.9 }}
                  >
                    {l.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )

  if (compact) {
    return (
      <div className="w-full" role="img" aria-label={label}>
        {board}
      </div>
    )
  }

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
        {board}
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
  const zone = zoneOf(PIVOT)
  const pivotName = `${x.row}9C5`

  // Schéma principal : le motif complet, en lettres, avec les deux traits « voit » de la case rouge.
  const main = new Map<number, CellSpec>([
    [PIVOT, { kind: "pivot", tokens: [T("A"), T("B")] }],
    [WING_A, { kind: "wing", tokens: [T("A"), T("C")] }],
    [WING_B, { kind: "wing", tokens: [T("B"), T("C")] }],
    [ELIM, { kind: "elim", tokens: [T("B"), T("C", true)] }],
  ])
  const mainLinks: Link[] = [
    { from: ELIM, to: WING_A, label: x.sameRow, dy: -0.15 },
    { from: ELIM, to: WING_B, label: x.sameCol, dx: 1.35 },
  ]

  // Cas 1 : le pivot vaut A -> l'aile AC devient C. Cas 2 : le pivot vaut B -> l'aile BC devient C.
  const case1 = new Map<number, CellSpec>([
    [PIVOT, { kind: "pivot", tokens: [T("A")] }],
    [WING_A, { kind: "wing", tokens: [T("A", true), T("C")] }],
    [WING_B, { kind: "wing", tokens: [T("B"), T("C")] }],
    [ELIM, { kind: "elim", tokens: [T("B"), T("C", true)] }],
  ])
  const case2 = new Map<number, CellSpec>([
    [PIVOT, { kind: "pivot", tokens: [T("B")] }],
    [WING_A, { kind: "wing", tokens: [T("A"), T("C")] }],
    [WING_B, { kind: "wing", tokens: [T("B", true), T("C")] }],
    [ELIM, { kind: "elim", tokens: [T("B"), T("C", true)] }],
  ])

  // Contre-exemple : les ailes ne sont pas dans la zone.
  const bad = new Map<number, CellSpec>([
    [PIVOT, { kind: "pivot", tokens: [T("2"), T("4")] }],
    [BAD_WING_1, { kind: "wing", tokens: [T("4"), T("5")] }],
    [BAD_WING_2, { kind: "wing", tokens: [T("2"), T("5")] }],
  ])

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
            <DiagramGrid zone={zone} cells={main} links={mainLinks} label={x.aria} rowLetter={x.row} />
            <Legend x={x} withElim />
          </div>

          <div className="space-y-3">
            <p className="font-semibold">{x.readTitle}</p>
            <ul className="space-y-2.5 text-sm leading-relaxed text-muted-foreground">
              {x.read.map((line, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">{i + 1}</span>
                  <span>
                    <Rich text={line} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="flex items-center gap-2 pt-1 text-sm font-medium text-primary">
              <Check className="size-4" />
              {x.ok}
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="text-lg font-bold">{x.whyTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{x.whyIntro}</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <p className="mb-2 text-sm font-semibold">{x.case1Title}</p>
              <DiagramGrid zone={zone} cells={case1} links={[{ from: ELIM, to: WING_A }]} label={x.case1Title} rowLetter={x.row} compact />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.case1}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <p className="mb-2 text-sm font-semibold">{x.case2Title}</p>
              <DiagramGrid zone={zone} cells={case2} links={[{ from: ELIM, to: WING_B }]} label={x.case2Title} rowLetter={x.row} compact />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.case2}</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="font-semibold">{x.conclTitle}</p>
            <p className="mt-1 text-sm leading-relaxed">{x.concl}</p>
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
            <DiagramGrid zone={zone} cells={bad} label={x.aria} rowLetter={x.row} />
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
