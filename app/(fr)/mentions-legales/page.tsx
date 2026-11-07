import type { Metadata } from "next"

import { pageAlternates } from "@/lib/i18n/paths"
import { LegalContent } from "@/components/legal-content"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Sudoku-Club : éditeur, hébergement et propriété intellectuelle.",
  alternates: pageAlternates("/mentions-legales", "fr"),
}

export default function LegalPage() {
  return <LegalContent />
}
