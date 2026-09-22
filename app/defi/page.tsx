import type { Metadata } from "next"

import { GamePageLayout } from "@/components/game-page-layout"
import { DailyGame } from "@/components/daily/daily-game"
import { DailyIntro } from "@/components/daily/daily-intro"

export const metadata: Metadata = {
  title: "Défi du jour — Sudoku Club",
  description:
    "Une seule grille de sudoku par jour, la même pour tout le monde. Terminez-la et inscrivez votre score au classement du jour.",
  alternates: { canonical: "/defi" },
}

export default function DailyPage() {
  return (
    <GamePageLayout>
      <DailyIntro />
      <DailyGame />
    </GamePageLayout>
  )
}
