import type { Metadata } from "next"

import { RulesContent } from "@/components/rules-content"

export const metadata: Metadata = {
  title: "Règles du sudoku — Comment jouer",
  description:
    "Apprenez les règles du sudoku en quelques minutes, avec une vidéo explicative : lignes, colonnes, régions, et comment remplir la grille sans erreur.",
  alternates: { canonical: "/regles" },
}

export default function RulesPage() {
  return <RulesContent />
}
