"use client"

import { PageLayout } from "@/components/page-layout"
import { useLanguage } from "@/lib/i18n/context"

export function LegalContent() {
  const { t } = useLanguage()
  const l = t.legal

  return (
    <PageLayout>
      <article className="max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{l.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {l.updated} {new Date().getFullYear()}
          </p>
        </header>

        {l.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
            <div className="space-y-3 leading-relaxed text-muted-foreground">
              <p>{section.text}</p>
            </div>
          </section>
        ))}
      </article>
    </PageLayout>
  )
}
