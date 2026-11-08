import type { Metadata } from "next"

import { PointsRulesContent } from "@/components/points-rules-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Règles des points : comment sont calculés les points",
  description:
    "Points par niveau, combos, bonus de temps et partie sans faute : tout savoir sur le calcul des points de Sudoku-Club.",
  alternates: pageAlternates("/regles-des-points", "fr"),
}

export default function Page() {
  return <PointsRulesContent />
}
