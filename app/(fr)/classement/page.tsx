import type { Metadata } from "next"

import { LeaderboardContent } from "@/components/leaderboard-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Classement général des joueurs de sudoku",
  description:
    "Le classement général de Sudoku-Club : les meilleurs joueurs du jour, de la semaine, du mois et de tous les temps. Ouvert à tous, sans compte.",
  alternates: pageAlternates("/classement", "fr"),
}

export default function Page() {
  return <LeaderboardContent />
}
