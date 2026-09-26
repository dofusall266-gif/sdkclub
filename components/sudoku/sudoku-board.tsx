"use client"

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
  flashIndices,
}: SudokuBoardProps) {
  const selRow = selected !== null ? rowOf(selected) : -1
  const selCol = selected !== null ? colOf(selected) : -1
  const selValue = selected !== null ? grid[selected] : 0

  function renderCell(index: number) {
    const r = rowOf(index)
    const c = colOf(index)
    const value = grid[index]
    const isGiven = given[index] !== 0
    const isSelected = selected === index
    const inScope = r === selRow || c === selCol || sameBox(index, selected)
    const sameNumber = value !== 0 && value === selValue
    const isConflict = conflicts.has(index)
    const isWrong = !isGiven && value !== 0 && value !== solution[index]
    const isFlashing = flashIndices?.has(index) ?? false

    return (
      <button
        key={index}
        type="button"
        role="gridcell"
        disabled={disabled}
        aria-label={`Ligne ${r + 1}, colonne ${c + 1}${value ? `, valeur ${value}` : ", vide"}`}
        aria-selected={isSelected}
        onClick={() => onSelect(index)}
        className={cn(
          "relative flex aspect-square items-center justify-center text-xl font-semibold transition-colors select-none sm:text-2xl",
          // Couleurs de fond selon l'état de la case.
          !isSelected && !inScope && "bg-card",
          !isSelected && inScope && "bg-secondary/60",
          sameNumber && !isSelected && "bg-primary/15",
          isSelected && "bg-primary/25",
          // Chiffres donnés vs saisis.
          isGiven ? "text-foreground" : "text-primary",
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
          <span className="grid h-full w-full grid-cols-3 grid-rows-3 p-0.5 text-[0.5rem] leading-none text-muted-foreground sm:text-[0.6rem]">
            {Array.from({ length: 9 }, (_, n) => (
              <span key={n} className="flex items-center justify-center">
                {notes[index].includes(n + 1) ? n + 1 : ""}
              </span>
            ))}
          </span>
        ) : null}
      </button>
    )
  }

  return (
    <div
      className="grid aspect-square w-full grid-cols-3 grid-rows-3 gap-[3px] overflow-hidden rounded-xl p-[3px] shadow-sm bg-[image:linear-gradient(135deg,var(--frame-a),var(--frame-b))]"
      role="grid"
      aria-label="Grille de sudoku"
    >
      {Array.from({ length: 9 }, (_, box) => {
        const boxRow = Math.floor(box / 3)
        const boxCol = box % 3
        return (
          <div key={box} className="grid grid-cols-3 grid-rows-3 gap-px bg-foreground/10">
            {Array.from({ length: 9 }, (_, cell) => {
              const localRow = Math.floor(cell / 3)
              const localCol = cell % 3
              const index = (boxRow * 3 + localRow) * 9 + (boxCol * 3 + localCol)
              return renderCell(index)
            })}
          </div>
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
