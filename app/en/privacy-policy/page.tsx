import type { Metadata } from "next"

import { PrivacyContent } from "@/components/privacy-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "Sudoku-Club's privacy policy: data collected, cookies, audience measurement and your rights.",
  alternates: pageAlternates("/politique-de-confidentialite", "en"),
}

export default function Page() {
  return <PrivacyContent />
}
