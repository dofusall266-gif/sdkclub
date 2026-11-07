import type { Metadata } from "next"

import { RulesContent } from "@/components/rules-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Sudoku rules — How to play",
  description:
    "Learn the rules of Sudoku in a few minutes, with an explainer video: rows, columns, boxes, and how to fill the grid without mistakes.",
  alternates: pageAlternates("/regles", "en"),
}

export default function Page() {
  return <RulesContent />
}
