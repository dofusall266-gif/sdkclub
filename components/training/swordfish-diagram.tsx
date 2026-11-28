"use client"

import { Check, X } from "lucide-react"

import { cell, DiagramGrid, Rich, T, type CellSpec, type Link } from "@/components/training/diagram-grid"
import { useLanguage } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

/**
 * Schémas pédagogiques du Swordfish (statiques) : 3 lignes de base (bleu), 3 colonnes (orange),
 * les places du 7 (vert), les 7 éliminés (rouge), puis pourquoi ça marche, avec les deux façons de placer les 7.
 */

// Exemple valide : le 7 n'a que 2 places dans L2, L5 et L8, et toutes tombent dans C1, C4 et C8.
const BASE_ROWS = [1, 4, 7]
const COVER_COLS = [0, 3, 7]
const CANDIDATES = [cell(1, 0), cell(1, 3), cell(4, 3), cell(4, 7), cell(7, 0), cell(7, 7)]
// 7 éliminés : dans les mêmes colonnes, sur d'autres lignes.
const ELIMS = [cell(5, 0), cell(2, 3), cell(8, 7)] // L6C1, L3C4, L9C8
// Les deux seules façons de placer les trois 7 dans le motif ci-dessus.
const WAY_1 = [cell(1, 0), cell(4, 3), cell(7, 7)]
const WAY_2 = [cell(1, 3), cell(4, 7), cell(7, 0)]
// Contre-exemple : les 7 des trois lignes se répartissent sur 4 colonnes (C1, C4, C8, C9).
const BAD_COLS = [0, 3, 7, 8]
const BAD_CANDIDATES = [cell(1, 0), cell(1, 3), cell(4, 3), cell(4, 7), cell(7, 0), cell(7, 8)]

const rowCells = (rows: number[]) => new Set(rows.flatMap((r) => Array.from({ length: 9 }, (_, c) => cell(r, c))))
const colCells = (cols: number[]) => new Set(cols.flatMap((c) => Array.from({ length: 9 }, (_, r) => cell(r, c))))

const TEXT = {
  fr: {
    heading: "Comprendre le Swordfish en schéma",
    intro:
      "Le Swordfish est un X-Wing agrandi : on regarde un seul chiffre (ici le 7) sur 3 lignes et 3 colonnes au lieu de 2 et 2. Les lignes sont appelées L1 à L9 et les colonnes C1 à C9.",
    row: "L",
    legendRows: "3 lignes de base",
    legendCols: "3 colonnes",
    legendCand: "7 possible (à garder)",
    legendElim: "7 éliminé",
    readTitle: "Comment lire le schéma",
    read: [
      "**3 lignes de base (en bleu)** : L2, L5 et L8. Dans chacune, le 7 n'a plus que 2 places possibles.",
      "**3 colonnes (en orange)** : C1, C4 et C8. Toutes ces places du 7 tiennent dans ces 3 colonnes, pas une de plus.",
      "**7 verts** : les seules places possibles du 7 dans les 3 lignes. Ils se trouvent là où une ligne bleue croise une colonne orange.",
      "**7 rouges** : des 7 possibles dans les mêmes colonnes, mais sur d'autres lignes. Ce sont eux qu'on va éliminer.",
    ],
    ok: "Valide : 3 lignes, et leurs 7 tiennent dans seulement 3 colonnes",
    whyTitle: "Pourquoi peut-on éliminer ces 7 ?",
    whyIntro:
      "Chaque ligne bleue doit contenir un 7, et il ne peut être que sur un 7 vert. Ici, il n'y a que deux façons de placer les trois 7 :",
    way1Title: "Façon 1",
    way1: "Les trois 7 sont en L2C1, L5C4 et L8C8 : un dans chaque colonne orange.",
    way2Title: "Façon 2",
    way2: "Les trois 7 sont en L2C4, L5C8 et L8C1 : là aussi, un dans chaque colonne orange.",
    conclTitle: "Conclusion",
    concl:
      "Dans les deux cas, chaque colonne orange contient déjà son 7, dans une ligne bleue. Une colonne ne peut avoir qu'un seul 7 : les 7 rouges, qui sont dans ces colonnes sur d'autres lignes, voient déjà un 7 dans leur colonne. Ils ne peuvent pas en contenir un, on les barre, sans avoir besoin de savoir quelle façon est la bonne.",
    goodToKnow: "Bon à savoir",
    know: [
      "Chaque ligne de base n'a pas besoin d'avoir 3 places : 2 ou 3 suffisent, tant que le total ne dépasse pas 3 colonnes.",
      "Le raisonnement marche aussi en échangeant lignes et colonnes : 3 colonnes de base dont les places tiennent dans 3 lignes.",
    ],
    badHeading: "À éviter : quatre colonnes au lieu de trois",
    badText:
      "Ici, les 7 des trois lignes se répartissent sur 4 colonnes (C1, C4, C8 et C9). Les trois 7 ne sont pas enfermés dans 3 colonnes : rien ne force les autres cases de ces colonnes, et on ne peut rien éliminer. Il faut que les places du chiffre tiennent dans exactement 3 colonnes.",
    ko: "Invalide : 4 colonnes au lieu de 3",
    aria: "Schéma d'une grille de sudoku illustrant le Swordfish",
  },
  en: {
    heading: "Understand the Swordfish with a diagram",
    intro:
      "The Swordfish is an enlarged X-Wing: we look at a single digit (here 7) across 3 rows and 3 columns instead of 2 and 2. Rows are called R1 to R9 and columns C1 to C9.",
    row: "R",
    legendRows: "3 base rows",
    legendCols: "3 columns",
    legendCand: "possible 7 (kept)",
    legendElim: "eliminated 7",
    readTitle: "How to read the diagram",
    read: [
      "**3 base rows (blue)**: R2, R5 and R8. In each one, the 7 has only 2 possible spots left.",
      "**3 columns (orange)**: C1, C4 and C8. All those spots for the 7 fit in these 3 columns, not one more.",
      "**Green 7s**: the only possible spots for the 7 in the 3 rows. They sit where a blue row crosses an orange column.",
      "**Red 7s**: possible 7s in the same columns, but on other rows. These are the ones we will eliminate.",
    ],
    ok: "Valid: 3 rows, and their 7s fit in just 3 columns",
    whyTitle: "Why can we eliminate these 7s?",
    whyIntro:
      "Each blue row must contain a 7, and it can only be on a green 7. Here, there are only two ways to place the three 7s:",
    way1Title: "Way 1",
    way1: "The three 7s are in R2C1, R5C4 and R8C8: one in each orange column.",
    way2Title: "Way 2",
    way2: "The three 7s are in R2C4, R5C8 and R8C1: again, one in each orange column.",
    conclTitle: "Conclusion",
    concl:
      "In both cases, each orange column already has its 7, in a blue row. A column can only hold one 7: the red 7s, which sit in those columns on other rows, already see a 7 in their column. They cannot hold one, so we cross them out, without needing to know which way is the real one.",
    goodToKnow: "Good to know",
    know: [
      "Each base row does not need 3 spots: 2 or 3 are enough, as long as the total stays within 3 columns.",
      "The reasoning also works with rows and columns swapped: 3 base columns whose spots fit in 3 rows.",
    ],
    badHeading: "Avoid this: four columns instead of three",
    badText:
      "Here, the 7s of the three rows are spread over 4 columns (C1, C4, C8 and C9). The three 7s are not locked into 3 columns: nothing forces the other cells of those columns, and nothing can be eliminated. The digit's spots must fit in exactly 3 columns.",
    ko: "Invalid: 4 columns instead of 3",
    aria: "Sudoku grid diagram illustrating the Swordfish",
  },
} as const

function Legend({ x, items }: { x: (typeof TEXT)["fr"] | (typeof TEXT)["en"]; items: ("rows" | "cols" | "cand" | "elim")[] }) {
  const defs = {
    rows: ["bg-sky-500/25 ring-1 ring-sky-500/60", x.legendRows],
    cols: ["bg-amber-500/25 ring-1 ring-amber-500/60", x.legendCols],
    cand: ["bg-primary/20 ring-2 ring-primary", x.legendCand],
    elim: ["bg-destructive/15 ring-2 ring-destructive", x.legendElim],
  } as const
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
      {items.map((k) => (
        <li key={k} className="flex items-center gap-2">
          <span className={cn("size-4 rounded", defs[k][0])} />
          {defs[k][1]}
        </li>
      ))}
    </ul>
  )
}

export function SwordfishExplainer() {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const rows = rowCells(BASE_ROWS)
  const cols = colCells(COVER_COLS)

  const seven = (kind: CellSpec["kind"], struck = false): CellSpec => ({ kind, tokens: [T("7", struck)] })

  // Schéma principal : les 6 places du 7 (vert) et les 3 7 éliminés (rouge).
  const main = new Map<number, CellSpec>([
    ...CANDIDATES.map((i) => [i, seven("wing")] as [number, CellSpec]),
    ...ELIMS.map((i) => [i, seven("elim", true)] as [number, CellSpec]),
  ])

  // « Façon 1 / 2 » : les trois 7 posés (case pleine), les autres places en discret, chaque 7 rouge relié au 7 posé dans sa colonne.
  const way = (placed: number[]) => {
    const m = new Map<number, CellSpec>([
      ...CANDIDATES.map((i) => [i, seven(placed.includes(i) ? "placed" : "dim")] as [number, CellSpec]),
      ...ELIMS.map((i) => [i, seven("elim", true)] as [number, CellSpec]),
    ])
    const links: Link[] = ELIMS.map((e) => ({ from: e, to: placed.find((p) => p % 9 === e % 9)! }))
    return { m, links }
  }
  const w1 = way(WAY_1)
  const w2 = way(WAY_2)

  // Contre-exemple : quatre colonnes utilisées.
  const bad = new Map<number, CellSpec>(BAD_CANDIDATES.map((i) => [i, seven("wing")] as [number, CellSpec]))
  const badRows = rows
  const badCols = colCells(BAD_COLS)

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">{x.heading}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{x.intro}</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,30rem)_1fr]">
          <div>
            <DiagramGrid zone={rows} zone2={cols} hiRows={BASE_ROWS} hiCols={COVER_COLS} cells={main} label={x.aria} rowLetter={x.row} />
            <Legend x={x} items={["rows", "cols", "cand", "elim"]} />
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
              <p className="mb-2 text-sm font-semibold">{x.way1Title}</p>
              <DiagramGrid zone={rows} zone2={cols} cells={w1.m} links={w1.links} label={x.way1Title} rowLetter={x.row} compact />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.way1}</p>
            </div>
            <div className="rounded-xl border border-border bg-secondary/30 p-3">
              <p className="mb-2 text-sm font-semibold">{x.way2Title}</p>
              <DiagramGrid zone={rows} zone2={cols} cells={w2.m} links={w2.links} label={x.way2Title} rowLetter={x.row} compact />
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{x.way2}</p>
            </div>
          </div>
          <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <p className="font-semibold">{x.conclTitle}</p>
            <p className="mt-1 text-sm leading-relaxed">{x.concl}</p>
          </div>
          <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 text-sm">
            <p className="font-semibold">{x.goodToKnow}</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
              {x.know.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
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
            <DiagramGrid zone={badRows} zone2={badCols} hiRows={BASE_ROWS} hiCols={BAD_COLS} cells={bad} label={x.aria} rowLetter={x.row} />
            <Legend x={x} items={["rows", "cols", "cand"]} />
          </div>
          <div className="space-y-3">
            <p className="text-sm leading-relaxed">{x.badText}</p>
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
