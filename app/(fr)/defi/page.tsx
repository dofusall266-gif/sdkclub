import type { Metadata } from "next"

import { pageAlternates } from "@/lib/i18n/paths"
import { GamePageLayout } from "@/components/game-page-layout"
import { DailyGame } from "@/components/daily/daily-game"
import { DailyIntro } from "@/components/daily/daily-intro"

export const metadata: Metadata = {
  title: "Défi du jour : une grille de sudoku par jour",
  description:
    "Une seule grille de sudoku par jour, la même pour tout le monde. Terminez-la et inscrivez votre score au classement du jour.",
  alternates: pageAlternates("/defi", "fr"),
}

export default function DailyPage() {
  return (
    <GamePageLayout>
      <DailyIntro />
      <DailyGame />
    </GamePageLayout>
  )
}
