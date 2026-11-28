"use client"

import { cn } from "@/lib/utils"

/**
 * Briques communes des schémas pédagogiques (Y-Wing, Swordfish) : une grille 9×9 avec repères L/C,
 * deux zones teintées (bleu et orange), cases mises en valeur et traits en pointillés. Purement visuel.
 * Les cases sont repérées comme sur le reste du site (L7C4 = ligne 7, colonne 4).
 */

export type Kind = "pivot" | "wing" | "elim" | "placed" | "dim"
export interface Token {
  text: string
  struck?: boolean
}
export interface CellSpec {
  kind: Kind
  tokens: Token[]
}
export interface Link {
  from: number
  to: number
  /** Texte posé près du trait (ex. « même ligne »). */
  label?: string
  /** Décalage du texte, en cases (1 case = 10 unités). */
  dx?: number
  dy?: number
}

export const cell = (r: number, c: number) => r * 9 + c
export const T = (text: string, struck = false): Token => ({ text, struck })

const KIND_STYLE: Record<Kind, string> = {
  pivot: "bg-amber-500/30 text-amber-700 ring-2 ring-inset ring-amber-500 dark:text-amber-300",
  wing: "bg-primary/20 text-primary ring-2 ring-inset ring-primary",
  elim: "bg-destructive/15 text-foreground ring-2 ring-inset ring-destructive",
  // Valeur posée (schémas « si c'est ici… ») : case pleine.
  placed: "bg-primary text-primary-foreground ring-2 ring-inset ring-primary",
  // Candidat qui reste possible mais n'est pas retenu dans ce scénario : discret.
  dim: "text-primary/55",
}

/** Transforme « **gras** » en <strong> (les textes de la liste y recourent). */
export function Rich({ text }: { text: string }) {
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
export function DiagramGrid({
  zone,
  zone2,
  hiRows = [],
  hiCols = [],
  cells,
  links = [],
  label,
  rowLetter,
  compact,
}: {
  /** Première zone teintée (bleu) : zone du pivot, lignes de base… */
  zone: Set<number>
  /** Seconde zone teintée (orange) : colonnes de couverture. Là où les deux se croisent, les teintes se mélangent. */
  zone2?: Set<number>
  /** Repères de lignes / colonnes à mettre en valeur (index 0-8). */
  hiRows?: number[]
  hiCols?: number[]
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
              zone2?.has(i) && !zone.has(i) && "bg-amber-500/15 dark:bg-amber-400/15",
              zone2?.has(i) && zone.has(i) && !spec && "bg-[linear-gradient(rgb(245_158_11/0.2),rgb(245_158_11/0.2))]",
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
            <span
              key={c}
              className={cn(
                "text-center text-[0.65rem] font-semibold text-muted-foreground sm:text-xs",
                hiCols.includes(c) && "font-extrabold text-amber-600 dark:text-amber-300",
              )}
            >
              C{c + 1}
            </span>
          ))}
        </div>
        <div className="grid grid-rows-9" aria-hidden>
          {Array.from({ length: 9 }, (_, r) => (
            <span
              key={r}
              className={cn(
                "grid place-items-center text-[0.65rem] font-semibold text-muted-foreground sm:text-xs",
                hiRows.includes(r) && "font-extrabold text-sky-600 dark:text-sky-300",
              )}
            >
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
