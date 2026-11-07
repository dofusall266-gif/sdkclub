import type { Metadata } from "next"

import { DailyGame } from "@/components/daily/daily-game"
import { DailyIntro } from "@/components/daily/daily-intro"
import { GamePageLayout } from "@/components/game-page-layout"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Daily Sudoku challenge: one puzzle a day",
  description:
    "One Sudoku puzzle a day, the same for everyone. Solve it and post your score on today's leaderboard.",
  alternates: pageAlternates("/defi", "en"),
}

export default function Page() {
  return (
    <GamePageLayout>
      <DailyIntro />
      <DailyGame />
    </GamePageLayout>
  )
}
