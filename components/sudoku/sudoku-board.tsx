"use client"

import { useEffect, useRef } from "react"

import { colOf, rowOf, type Grid } from "@/lib/sudoku"
import { cn } from "@/lib/utils"

interface SudokuBoardProps {
  grid: Grid
  given: Grid
  notes: number[][]
  solution: Grid
  selected: number | null
  conflicts: Set<number>
  disabled?: boolean
  onSelect: (index: number) => void
  /** Maj + clic / glisser : ajoute une case à la sélection (`toggle` : la retire si déjà sélectionnée). */
  onExtend?: (index: number, toggle?: boolean) => void
  /** Autres cases de la sélection multiple, en plus de `selected`. */
  multi?: number[]
  /** Cases à mettre brièvement en surbrillance (ligne/colonne/bloc qui vient d'être complété). */
  flashIndices?: Set<number>
}

export function SudokuBoard({
  grid,
  given,
  notes,
  solution,
  selected,
  conflicts,
  disabled,
  onSelect,
  onExtend,
  multi,
  flashIndices,
}: SudokuBoardProps) {
  const multiSet = new Set(multi ?? [])
  // Glisser avec Maj enfoncé : chaque case survolée est ajoutée à la sélection.
  const draggingRef = useRef(false)
  useEffect(() => {
    const stop = () => {
      draggingRef.current = false
    }
    window.addEventListener("mouseup", stop)
    return () => window.removeEventListener("mouseup", stop)
  }, [])

  const selRow = selected !== null ? rowOf(selected) : -1
  const selCol = selected !== null ? colOf(selected) : -1
  const selValue = selected !== null ? grid[selected] : 0

  // Le focus réel du navigateur (celui qui dessine l'anneau de sélection via
  // :focus-visible) ne bouge pas tout seul quand on change de case au clavier
  // (les flèches déplacent l'état React `selected`, pas le focus DOM). Sans ce
  // recalage, l'anneau restait visuellement "collé" sur la dernière case
  // cliquée à la souris pendant qu'on naviguait ailleurs au clavier.
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([])
  useEffect(() => {
    if (selected !== null) cellRefs.current[selected]?.focus({ preventScroll: true })
  }, [selected])

  return (
    <div
      className="grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-xl border-2 border-foreground/70 bg-card shadow-sm"
      role="grid"
      aria-label="Grille de sudoku"
    >
      {grid.map((value, index) => {
        const r = rowOf(index)
        const c = colOf(index)
        const isGiven = given[index] !== 0
        const isSelected = selected === index
        const isMulti = multiSet.has(index)
        const inScope = r === selRow || c === selCol || sameBox(index, selected)
        const sameNumber = value !== 0 && value === selValue
        const isConflict = conflicts.has(index)
        const isWrong = !isGiven && value !== 0 && value !== solution[index]
        const isFlashing = flashIndices?.has(index) ?? false

        return (
          <button
            key={index}
            ref={(el) => {
              cellRefs.current[index] = el
            }}
            type="button"
            role="gridcell"
            disabled={disabled}
            aria-label={`Ligne ${r + 1}, colonne ${c + 1}${value ? `, valeur ${value}` : ", vide"}`}
            aria-selected={isSelected || isMulti}
            onMouseDown={(e) => {
              if (!e.shiftKey || !onExtend) return
              e.preventDefault() // évite la sélection de texte pendant le glisser
              draggingRef.current = true
              onExtend(index, true)
            }}
            onMouseEnter={(e) => {
              if (draggingRef.current && e.buttons === 1) onExtend?.(index)
            }}
            onClick={(e) => {
              if (e.shiftKey && onExtend) return // déjà géré au mousedown
              onSelect(index)
            }}
            className={cn(
              "relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden text-xl font-semibold transition-colors select-none sm:text-2xl",
              "border-r border-b border-border/70",
              c % 3 === 2 && c !== 8 && "border-r-2 border-r-foreground/55",
              r % 3 === 2 && r !== 8 && "border-b-2 border-b-foreground/55",
              c === 8 && "border-r-0",
              r === 8 && "border-b-0",
              // Couleurs de fond selon l'état de la case.
              !isSelected && !isMulti && !inScope && "bg-card",
              !isSelected && !isMulti && inScope && "bg-secondary/60",
              sameNumber && !isSelected && !isMulti && "bg-primary/15",
              (isSelected || isMulti) && "bg-primary/25",
              isMulti && "ring-1 ring-inset ring-primary/50",
              // Chiffres donnés (toujours neutres) vs saisis par le joueur (teintés
              // seulement pendant que la case est sélectionnée, pas en permanence —
              // sinon la couleur reste "collée" même une fois qu'on a bougé ailleurs).
              isGiven ? "text-foreground" : isSelected ? "text-primary" : "text-foreground",
              isWrong && "text-destructive",
              isConflict && "text-destructive",
              isFlashing && "animate-cell-flash",
              !disabled && "cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            {value !== 0 ? (
              value
            ) : notes[index].length > 0 ? (
              <span className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-0.5 text-[0.5rem] leading-none text-muted-foreground sm:text-[0.6rem]">
                {Array.from({ length: 9 }, (_, n) => (
                  <span key={n} className="flex items-center justify-center">
                    {notes[index].includes(n + 1) ? n + 1 : ""}
                  </span>
                ))}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

function sameBox(a: number, b: number | null): boolean {
  if (b === null) return false
  const boxA = Math.floor(rowOf(a) / 3) * 3 + Math.floor(colOf(a) / 3)
  const boxB = Math.floor(rowOf(b) / 3) * 3 + Math.floor(colOf(b) / 3)
  return boxA === boxB
}
