import type { Metadata } from "next"

import { ContactContent } from "@/components/contact-content"

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question, une suggestion ou un bug à signaler ? Contactez l'équipe de Sudoku Club.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return <ContactContent />
}
