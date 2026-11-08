import type { Metadata } from "next"

import { LeaderboardContent } from "@/components/leaderboard-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Overall Sudoku leaderboard",
  description:
    "The Sudoku-Club overall leaderboard: the best players today, this week, this month and all time. Open to everyone, no account needed.",
  alternates: pageAlternates("/classement", "en"),
}

export default function Page() {
  return <LeaderboardContent />
}
