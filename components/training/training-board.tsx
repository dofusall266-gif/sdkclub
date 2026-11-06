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
  /** Vignette : n'affiche que le chiffre du motif ("digit") ou que les cases du motif ("cells"). */
  thumbnail?: "digit" | "cells"
  /** Classes supplémentaires pour le conteneur (ex. largeur minimale en mode zoom). */
  className?: string
}

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * Grille avec toutes les notes (candidats) à leur place habituelle : 1 en haut à gauche, 9 en bas à droite.
 * Les colonnes et les lignes sont numérotées de 1 à 9 (comme dans les explications : L3C5 = ligne 3, colonne 5).
 */
export function TrainingBoard({ dc, selected, onToggle, focusDigits = [], reveal, shade = [], tint, readOnly, thumbnail, className }: Props) {
  const revealCells = new Set(reveal?.c ?? [])
  const revealElims = new Set(reveal?.e ?? [])
  const baseLines = new Set<string>()
  const coverLines = new Set<string>()
  const lineSources = [...shade, ...(reveal?.l ? [reveal.l] : [])]
  for (const l of lineSources) {
    for (const b of l.b) baseLines.add(`${l.k}${b}`)
    for (const v of l.v) coverLines.add(`${l.k === "r" ? "c" : "r"}${v}`)
  }
  const showLabels = !thumbnail

  const grid = (
    <div className="grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-xl border-2 border-foreground/70 bg-card shadow-sm">
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
            <span className="text-xl font-semibold text-foreground/80 sm:text-2xl">{value}</span>
          ) : (
            <span className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-px sm:p-0.5">
              {Array.from({ length: 9 }, (_, k) => {
                const d = k + 1
                if (!dc.candidates[i].includes(d)) return <span key={d} />
                if (thumbnail === "digit" && d !== reveal?.d) return <span key={d} />
                if (thumbnail === "cells" && !(isPattern || revealElims.has(i))) return <span key={d} />
                const eliminated = revealElims.has(i) && reveal?.d === d
                // Candidat éliminé par la technique : il est retiré de la grille (l'explication indique lesquels).
                if (eliminated && !thumbnail) return <span key={d} />
                const sameDigit = focusDigits.includes(d)
                const inPattern = isPattern && reveal?.d === d
                // Quand le motif est montré, seuls les chiffres du motif sont en vert :
                // les autres exemplaires du même chiffre restent des notes ordinaires.
                const focus = reveal ? inPattern : sameDigit
                return (
                  <span
                    key={d}
                    className={cn(
                      "flex items-center justify-center text-[0.62rem] font-medium leading-none sm:text-[0.7rem]",
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
          canClick && "cursor-pointer touch-manipulation hover:bg-primary/15 active:bg-primary/25",
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
            aria-label={`L${r + 1}C${c + 1} : ${dc.candidates[i].join(" ")}`}
          >
            {content}
          </button>
        )
      })}
    </div>
  )

  if (!showLabels) return <div className={cn("w-full max-w-[34rem]", className)}>{grid}</div>

  /** Style d'un repère de ligne / colonne : mis en valeur s'il fait partie du motif. */
  const labelCls = (key: string) =>
    cn(
      "grid place-items-center rounded text-[0.7rem] font-semibold text-muted-foreground sm:text-xs",
      baseLines.has(key) && "bg-primary/15 font-bold text-primary",
      coverLines.has(key) && !baseLines.has(key) && "bg-secondary font-bold text-foreground",
    )

  return (
    <div className={cn("w-full max-w-[36rem]", className)}>
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-1 gap-y-1 sm:grid-cols-[1.5rem_minmax(0,1fr)]">
        <span aria-hidden />
        <div className="grid grid-cols-9 px-0.5" aria-hidden>
          {NUMBERS.map((n, c) => (
            <span key={n} className={labelCls(`c${c}`)}>
              {n}
            </span>
          ))}
        </div>
        <div className="grid grid-rows-9 py-0.5" aria-hidden>
          {NUMBERS.map((n, r) => (
            <span key={n} className={labelCls(`r${r}`)}>
              {n}
            </span>
          ))}
        </div>
        {grid}
      </div>
    </div>
  )
}
