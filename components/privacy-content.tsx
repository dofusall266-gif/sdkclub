"use client"

import { PageLayout } from "@/components/page-layout"
import { useLanguage } from "@/lib/i18n/context"

export function PrivacyContent() {
  const { t } = useLanguage()
  const p = t.privacy

  return (
    <PageLayout>
      <article className="max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{p.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {p.updated} {new Date().getFullYear()}
          </p>
        </header>

        {p.sections.map((section) => (
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
