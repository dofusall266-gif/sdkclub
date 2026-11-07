import type { Metadata } from "next"

import { LegalContent } from "@/components/legal-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Legal notice",
  description:
    "Legal notice for the Sudoku-Club website: publisher, hosting and intellectual property.",
  alternates: pageAlternates("/mentions-legales", "en"),
}

export default function Page() {
  return <LegalContent />
}
