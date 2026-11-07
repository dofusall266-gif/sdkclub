import type { Metadata } from "next"

import { ContactContent } from "@/components/contact-content"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "A question, a suggestion or a bug to report? Contact the Sudoku-Club team.",
  alternates: pageAlternates("/contact", "en"),
}

export default function Page() {
  return <ContactContent />
}
