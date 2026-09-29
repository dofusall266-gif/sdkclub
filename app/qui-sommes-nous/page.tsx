import type { Metadata } from "next"

import { AboutContent } from "@/components/about-content"

export const metadata: Metadata = {
  title: "Qui sommes-nous ?",
  description: "Sudoku Club est né de la passion d'une petite équipe pour le sudoku : gratuit, sans compte, avec des grilles vérifiées.",
  alternates: { canonical: "/qui-sommes-nous" },
}

export default function AboutPage() {
  return <AboutContent />
}
