import type { Metadata } from "next"

import { AboutContent } from "@/components/about-content"

export const metadata: Metadata = {
  title: "Qui sommes-nous ?",
  description:
    "Qui est derrière Sudoku Club : notre démarche (grilles vérifiées, sans compte, sans paywall) et notre chaîne YouTube dédiée au sudoku.",
  alternates: { canonical: "/a-propos" },
}

export default function AboutPage() {
  return <AboutContent />
}
