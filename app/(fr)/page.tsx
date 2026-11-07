import type { Metadata } from "next"

import { HomeView } from "@/components/home-view"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Sudoku-Club — Jouer au sudoku gratuit, défi du jour",
  description:
    "Jouez au sudoku gratuit en ligne, sans inscription : 6 niveaux du Facile au Fou, un défi du jour classé et des grilles à imprimer en PDF.",
  alternates: pageAlternates("/", "fr"),
}

export default function HomePage() {
  return <HomeView locale="fr" />
}
