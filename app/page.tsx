import type { Metadata } from "next"

import { BlogTeaser } from "@/components/blog-teaser"
import { GamePageLayout } from "@/components/game-page-layout"
import { DailyBanner } from "@/components/daily-banner"
import { SudokuGame } from "@/components/sudoku/sudoku-game"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Sudoku Club — Jouer au sudoku gratuit en ligne",
  description:
    "Jouez au sudoku gratuitement en ligne : grilles uniques générées à l'infini, 4 niveaux de difficulté, minuteur et impression PDF. Sans inscription.",
  alternates: { canonical: "/" },
}

export default function HomePage() {
  const latestPostsFr = getAllPosts("fr").slice(0, 3)
  const latestPostsEn = getAllPosts("en").slice(0, 3)

  return (
    <GamePageLayout>
      <DailyBanner />
      <SudokuGame />
      <BlogTeaser fr={latestPostsFr} en={latestPostsEn} />
    </GamePageLayout>
  )
}
