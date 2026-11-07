import type { Metadata } from "next"

import { pageAlternates } from "@/lib/i18n/paths"
import { TechniquesContent } from "@/components/techniques-content"

export const metadata: Metadata = {
  title: "Techniques et astuces de sudoku",
  description:
    "Progressez au sudoku grâce à des techniques éprouvées et accessibles : candidat unique, paires nues, pointage, paires cachées et gestion des notes.",
  alternates: pageAlternates("/techniques", "fr"),
}

export default function TechniquesPage() {
  return <TechniquesContent />
}
