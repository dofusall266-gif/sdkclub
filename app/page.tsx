import type { Metadata } from "next"

import { PageLayout } from "@/components/page-layout"
import { SudokuGame } from "@/components/sudoku/sudoku-game"
import type { Difficulty } from "@/lib/sudoku"

export const metadata: Metadata = {
  title: "Sudoku Club — Jouer au sudoku gratuit en ligne",
  description:
    "Jouez au sudoku gratuitement en ligne : grilles uniques générées à l'infini, 4 niveaux de difficulté, minuteur et impression PDF. Sans inscription.",
  alternates: { canonical: "/" },
}

const VALID: Difficulty[] = ["facile", "moyen", "difficile", "expert"]

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ niveau?: string }>
}) {
  const { niveau } = await searchParams
  const initialDifficulty: Difficulty = VALID.includes(niveau as Difficulty) ? (niveau as Difficulty) : "facile"

  return (
    <PageLayout>
      <SudokuGame initialDifficulty={initialDifficulty} />
    </PageLayout>
  )
}
