import type { Metadata } from "next"

import { pageAlternates } from "@/lib/i18n/paths"
import { ContactContent } from "@/components/contact-content"

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question, une suggestion ou un bug à signaler ? Contactez l'équipe de Sudoku-Club.",
  alternates: pageAlternates("/contact", "fr"),
}

export default function ContactPage() {
  return <ContactContent />
}
