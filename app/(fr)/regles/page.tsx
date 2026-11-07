import type { Metadata } from "next"

import { pageAlternates } from "@/lib/i18n/paths"
import { RulesContent } from "@/components/rules-content"

export const metadata: Metadata = {
  title: "Règles du sudoku — Comment jouer",
  description:
    "Apprenez les règles du sudoku en quelques minutes, avec une vidéo explicative : lignes, colonnes, régions, et comment remplir la grille sans erreur.",
  alternates: pageAlternates("/regles", "fr"),
}

export default function RulesPage() {
  return <RulesContent />
}
