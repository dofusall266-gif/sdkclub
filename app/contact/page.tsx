import type { Metadata } from "next"

import { ContactForm } from "@/components/contact-form"
import { PageLayout } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question, une suggestion ou un bug à signaler ? Contactez l'équipe de Sudoku Club.",
  alternates: { canonical: "/contact" },
}

export default function ContactPage() {
  return (
    <PageLayout>
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Contact</h1>
        <p className="mt-3 text-muted-foreground">
          Une question, une suggestion d&apos;amélioration ou un bug à signaler&nbsp;? Écrivez-nous, nous lisons tous
          les messages.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </PageLayout>
  )
}
