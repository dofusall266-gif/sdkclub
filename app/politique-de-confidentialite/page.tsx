import type { Metadata } from "next"

import { PrivacyContent } from "@/components/privacy-content"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Sudoku Club : données collectées, cookies, mesure d'audience et vos droits.",
  alternates: { canonical: "/politique-de-confidentialite" },
}

export default function PrivacyPage() {
  return <PrivacyContent />
}
