import type { Metadata } from "next"

import { PointsRulesContent } from "@/components/points-rules-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Points rules: how points are calculated",
  description:
    "Points per level, combos, time bonus and flawless games: everything about how Sudoku-Club points are calculated.",
  alternates: pageAlternates("/regles-des-points", "en"),
}

export default function Page() {
  return <PointsRulesContent />
}
