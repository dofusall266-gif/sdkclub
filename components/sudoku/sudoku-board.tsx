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
  /** Vague de victoire / zone complétée : délai (ms) de l'animation de chaque case. */
  waveDelays?: Map<number, number>
  /** Case qui vient de recevoir un bon chiffre (animation « pop »). `id` relance l'animation. */
  popCell?: { index: number; id: number } | null
  /** Case qui vient de recevoir un mauvais chiffre (animation « secousse »). */
  shakeCell?: { index: number; id: number } | null
  /** Points gagnés, affichés brièvement dans la case. */
  gainFloat?: { index: number; text: string; id: number } | null
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
  waveDelays,
  popCell,
  shakeCell,
  gainFloat,
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

  // Cases « sources » des surbrillances : parmi toutes les cases sélectionnées (case principale + Maj + clic),
  // celles qui contiennent un chiffre. Ainsi, en ajoutant des cases vides avec Maj, le chiffre choisi au départ
  // garde sa surbrillance (mêmes chiffres + zone « défendue »). Sans chiffre sélectionné, on garde la case principale.
  const allSelected = selected !== null ? [selected, ...(multi ?? [])] : []
  const digitSources = allSelected.filter((i) => grid[i] !== 0)
  const sources = digitSources.length > 0 ? digitSources : selected !== null ? [selected] : []
  const sourceValues = new Set(digitSources.map((i) => grid[i]))
  const scopeRows = new Set(sources.map(rowOf))
  const scopeCols = new Set(sources.map(colOf))
  const scopeBoxes = new Set(sources.map(boxOf))

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
      className="grid aspect-square w-full grid-cols-9 grid-rows-9 overflow-hidden rounded-xl border-[3px] border-foreground bg-card shadow-sm"
      role="grid"
      aria-label="Grille de sudoku"
    >
      {grid.map((value, index) => {
        const r = rowOf(index)
        const c = colOf(index)
        const isGiven = given[index] !== 0
        const isSelected = selected === index
        const isMulti = multiSet.has(index)
        const inScope = scopeRows.has(r) || scopeCols.has(c) || scopeBoxes.has(boxOf(index))
        const sameNumber = value !== 0 && sourceValues.has(value)
        const isConflict = conflicts.has(index)
        const isWrong = !isGiven && value !== 0 && value !== solution[index]
        const isFlashing = flashIndices?.has(index) ?? false
        const waveDelay = waveDelays?.get(index)
        const popId = popCell?.index === index ? popCell.id : null
        const shakeId = shakeCell?.index === index ? shakeCell.id : null

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
            style={waveDelay !== undefined ? { animationDelay: `${waveDelay}ms` } : undefined}
            className={cn(
              "relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden text-xl transition-colors select-none sm:text-[1.7rem]",
              // Lignes fines bien visibles, séparations des blocs 3×3 nettement plus épaisses.
              "border-r border-b border-foreground/25",
              c % 3 === 2 && c !== 8 && "border-r-[3px] border-r-foreground/80",
              r % 3 === 2 && r !== 8 && "border-b-[3px] border-b-foreground/80",
              c === 8 && "border-r-0",
              r === 8 && "border-b-0",
              // Trois niveaux bien distincts :
              //  1. la zone « défendue » par la case sélectionnée (sa ligne, sa colonne et son bloc) : beige foncé ;
              //  2. les cases qui contiennent le même chiffre : vert olive + liseré ;
              //  3. la case sélectionnée : vert olive plus soutenu + contour épais.
              !isSelected && !isMulti && !inScope && "bg-card",
              !isSelected && !isMulti && inScope && "bg-muted/60 dark:bg-muted",
              sameNumber && !isSelected && !isMulti && "bg-primary/18 ring-2 ring-inset ring-primary/45",
              // Toutes les cases sélectionnées (case principale ET cases ajoutées avec Maj) ont le même rendu bien visible.
              (isSelected || isMulti) && "bg-primary/24 ring-[3px] ring-inset ring-primary",
              // Chiffres de départ : gras et sombres. Chiffres posés par le joueur : bleu encre, en permanence.
              isGiven ? "font-bold text-foreground" : "font-semibold text-entry",
              isWrong && "text-destructive",
              isConflict && "text-destructive",
              isFlashing && "animate-cell-flash",
              waveDelay !== undefined && "animate-cell-wave",
              !disabled && "cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
            )}
          >
            {value !== 0 ? (
              <span
                key={popId !== null ? `pop-${popId}` : shakeId !== null ? `shake-${shakeId}` : "v"}
                className={cn(popId !== null && "animate-cell-pop", shakeId !== null && "animate-cell-shake")}
              >
                {value}
              </span>
            ) : notes[index].length > 0 ? (
              // Notes plus grandes et plus contrastées ; celle qui correspond au chiffre sélectionné ressort en gras.
              <span className="absolute inset-0 grid grid-cols-3 grid-rows-3 p-[2px] text-[0.62rem] leading-none font-medium text-foreground/75 min-[420px]:text-[0.7rem] sm:p-1 sm:text-[0.8rem]">
                {Array.from({ length: 9 }, (_, n) => (
                  <span
                    key={n}
                    className={cn("flex items-center justify-center", sourceValues.has(n + 1) && "font-extrabold text-primary")}
                  >
                    {notes[index].includes(n + 1) ? n + 1 : ""}
                  </span>
                ))}
              </span>
            ) : null}
            {gainFloat?.index === index && (
              <span
                key={gainFloat.id}
                aria-hidden="true"
                className="animate-gain-float pointer-events-none absolute top-0.5 left-1/2 -translate-x-1/2 text-[0.6rem] font-bold text-flash sm:text-xs"
              >
                {gainFloat.text}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function boxOf(index: number): number {
  return Math.floor(rowOf(index) / 3) * 3 + Math.floor(colOf(index) / 3)
}
