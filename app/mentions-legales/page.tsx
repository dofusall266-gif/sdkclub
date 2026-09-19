import type { Metadata } from "next"

import { LegalContent } from "@/components/legal-content"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Sudoku Club : éditeur, hébergement et propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
}

export default function LegalPage() {
  return <LegalContent />
}
