import type { Metadata } from "next"

import { BlogTeaser } from "@/components/blog-teaser"
import { GamePageLayout } from "@/components/game-page-layout"
import { DailyBanner } from "@/components/daily-banner"
import { SudokuGame } from "@/components/sudoku/sudoku-game"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Sudoku-Club — Jouer au sudoku gratuit, défi du jour",
  description:
    "Jouez au sudoku gratuit en ligne, sans inscription : 6 niveaux du Facile au Fou, un défi du jour classé et des grilles à imprimer en PDF.",
  alternates: { canonical: "/" },
}

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 3)

  return (
    <GamePageLayout>
      <DailyBanner />
      <SudokuGame />
      <BlogTeaser posts={latestPosts} />
    </GamePageLayout>
  )
}
