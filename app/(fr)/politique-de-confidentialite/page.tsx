import type { Metadata } from "next"

import { pageAlternates } from "@/lib/i18n/paths"
import { PrivacyContent } from "@/components/privacy-content"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Sudoku-Club : données collectées, cookies, mesure d'audience et vos droits.",
  alternates: pageAlternates("/politique-de-confidentialite", "fr"),
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
