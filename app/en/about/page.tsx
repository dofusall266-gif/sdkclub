import type { Metadata } from "next"

import { AboutContent } from "@/components/about-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "About us",
  description:
    "Sudoku-Club was born from a small team's passion for Sudoku: free, no account, with verified puzzles.",
  alternates: pageAlternates("/qui-sommes-nous", "en"),
}

export default function Page() {
  return <AboutContent />
}
