"use client"

import type { DecodedCase, TrainingPattern } from "@/lib/training"
import { cn } from "@/lib/utils"

interface Props {
  dc: DecodedCase
  selected?: Set<number>
  onToggle?: (index: number) => void
  /** Chiffres à mettre en évidence dans les notes. */
  focusDigits?: number[]
  /** Motif à montrer (cases, candidats éliminés, lignes). */
  reveal?: TrainingPattern | null
  /** Lignes / colonnes à teinter (indices), sans montrer le motif complet. */
  shade?: { k: "r" | "c"; b: number[]; v: number[] }[]
  /** Cases à teinter (indice : cases à deux candidats, pivot…). */
  tint?: Set<number>
  /** Pavé « lecture seule » : pas de boutons. */
  readOnly?: boolean
}

/** Grille avec toutes les notes (candidats) à leur place habituelle : 1 en haut à gauche, 9 en bas à droite. */
export function TrainingBoard({ dc, selected, onToggle, focusDigits = [], reveal, shade = [], tint, readOnly }: Props) {
  const revealCells = new Set(reveal?.c ?? [])
  const revealElims = new Set(reveal?.e ?? [])
  const baseLines = new Set<string>()
  const coverLines = new Set<string>()
  const lineSources = [...shade, ...(reveal?.l ? [reveal.l] : [])]
  for (const l of lineSources) {
    for (const b of l.b) baseLines.add(`${l.k}${b}`)
    for (const v of l.v) coverLines.add(`${l.k === "r" ? "c" : "r"}${v}`)
  }

  return (
    <div className="grid aspect-square w-full max-w-[34rem] grid-cols-9 grid-rows-9 overflow-hidden rounded-xl border-2 border-foreground/70 bg-card shadow-sm">
      {dc.values.map((value, i) => {
        const r = Math.floor(i / 9)
        const c = i % 9
        const isPattern = revealCells.has(i)
        const isSelected = selected?.has(i) ?? false
        const onBase = baseLines.has(`r${r}`) || baseLines.has(`c${c}`)
        const onCover = coverLines.has(`r${r}`) || coverLines.has(`c${c}`)
        const canClick = !readOnly && value === 0 && !!onToggle

        const content =
          value !== 0 ? (
            <span className="text-lg font-semibold text-foreground/80 sm:text-2xl">{value}</span>
          ) : (
            <span className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-px sm:p-0.5">
              {Array.from({ length: 9 }, (_, k) => {
                const d = k + 1
                if (!dc.candidates[i].includes(d)) return <span key={d} />
                const eliminated = revealElims.has(i) && reveal?.d === d
                const focus = focusDigits.includes(d) || (isPattern && reveal?.d === d)
                return (
                  <span
                    key={d}
                    className={cn(
                      "flex items-center justify-center text-[0.5rem] leading-none sm:text-[0.7rem]",
                      eliminated
                        ? "rounded-full bg-destructive/20 font-bold text-destructive line-through"
                        : focus
                          ? "font-bold text-primary"
                          : "text-muted-foreground/70",
                    )}
                  >
                    {d}
                  </span>
                )
              })}
            </span>
          )

        const cls = cn(
          "relative flex min-h-0 min-w-0 items-center justify-center border-border transition-colors",
          "border-b border-r",
          c % 3 === 2 && c !== 8 && "border-r-2 border-r-foreground/40",
          r % 3 === 2 && r !== 8 && "border-b-2 border-b-foreground/40",
          c === 8 && "border-r-0",
          r === 8 && "border-b-0",
          onBase && "bg-primary/10",
          onCover && !onBase && "bg-secondary/70",
          tint?.has(i) && "bg-chart-4/25",
          isPattern && "bg-primary/30 ring-1 ring-inset ring-primary",
          isSelected && "bg-primary/25 ring-2 ring-inset ring-primary",
          canClick && "cursor-pointer hover:bg-primary/15",
        )

        if (!canClick) {
          return (
            <div key={i} className={cls}>
              {content}
            </div>
          )
        }
        return (
          <button
            key={i}
            type="button"
            className={cls}
            onClick={() => onToggle!(i)}
            aria-pressed={isSelected}
            aria-label={`${r + 1}-${c + 1} : ${dc.candidates[i].join(" ")}`}
          >
            {content}
          </button>
        )
      })}
    </div>
  )
}
