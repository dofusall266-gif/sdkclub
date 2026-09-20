import type { Metadata } from "next"

import { PageLayout } from "@/components/page-layout"
import { SudokuGame } from "@/components/sudoku/sudoku-game"

export const metadata: Metadata = {
  title: "Sudoku Club — Jouer au sudoku gratuit en ligne",
  description:
    "Jouez au sudoku gratuitement en ligne : grilles uniques générées à l'infini, 4 niveaux de difficulté, minuteur et impression PDF. Sans inscription.",
  alternates: { canonical: "/" },
}

export default function HomePage() {
  return (
    <PageLayout>
      <SudokuGame />
    </PageLayout>
  )
}
