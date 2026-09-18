import { colOf, rowOf, type Grid } from "@/lib/sudoku"
import { cn } from "@/lib/utils"

/**
 * Grille statique en noir et blanc, pensée pour l'impression papier / PDF.
 */
export function PrintableGrid({ grid, title }: { grid: Grid; title?: string }) {
  return (
    <div className="print-page flex flex-col items-center">
      {title && <h2 className="mb-4 text-center text-xl font-bold text-black">{title}</h2>}
      <div className="grid aspect-square w-full max-w-[18cm] grid-cols-9 border-2 border-black">
        {grid.map((value, index) => {
          const c = colOf(index)
          const r = rowOf(index)
          return (
            <div
              key={index}
              className={cn(
                "flex aspect-square items-center justify-center border border-neutral-400 text-xl font-semibold text-black",
                c % 3 === 2 && c !== 8 && "border-r-2 border-r-black",
                r % 3 === 2 && r !== 8 && "border-b-2 border-b-black",
              )}
            >
              {value !== 0 ? value : ""}
            </div>
          )
        })}
      </div>
    </div>
  )
}
