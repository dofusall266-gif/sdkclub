"use client"

import { ContactForm } from "@/components/contact-form"
import { PageLayout } from "@/components/page-layout"
import { useLanguage } from "@/lib/i18n/context"

export function ContactContent() {
  const { t } = useLanguage()

  return (
    <PageLayout>
      <div className="max-w-xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.contact.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.contact.intro}</p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </div>
    </PageLayout>
  )
}
