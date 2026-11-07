import type { Metadata } from "next"

import { HomeView } from "@/components/home-view"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Sudoku-Club — Free online Sudoku, daily challenge",
  description:
    "Play free Sudoku online, no sign-up: 6 difficulty levels from Easy to Crazy, a ranked daily challenge and printable PDF puzzles.",
  alternates: pageAlternates("/", "en"),
}

export default function HomePage() {
  return <HomeView locale="en" />
}
