import type { Metadata } from "next"

import { TechniquesContent } from "@/components/techniques-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Sudoku techniques and tips",
  description:
    "Improve at Sudoku with proven, accessible techniques: single candidates, naked pairs, pointing pairs, hidden pairs and note-taking.",
  alternates: pageAlternates("/techniques", "en"),
}

export default function Page() {
  return <TechniquesContent />
}
