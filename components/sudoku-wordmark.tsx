import { cn } from "@/lib/utils"

/** Nom du site, avec un trait d'union mis en scène : une pilule dont la couleur
 * passe du « Sudoku » (couleur du texte) au « Club » (vert), pour relier les
 * deux mots. Il rend l'adresse sudoku-club.com immédiatement reconnaissable
 * (et distincte de sudoku.club). Tout est en `em` : la taille suit celle du
 * texte (`text-lg`, `text-base`…). */
export function SudokuWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center font-bold tracking-tight", className)} role="img" aria-label="Sudoku-Club">
      <span aria-hidden="true">Sudoku</span>
      <span
        aria-hidden="true"
        className="mx-[0.11em] mt-[0.09em] inline-block h-[0.22em] w-[0.6em] shrink-0 rounded-full"
        style={{ backgroundImage: "linear-gradient(90deg, var(--foreground), var(--primary))" }}
      />
      <span aria-hidden="true" className="text-primary">
        Club
      </span>
    </span>
  )
}
