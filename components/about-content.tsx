"use client"

import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { useLanguage } from "@/lib/i18n/context"

export function AboutContent() {
  const { t } = useLanguage()
  const a = t.about

  return (
    <PageLayout>
      <article className="max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{a.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{a.intro}</p>
        </header>

        {a.sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
            <p className="leading-relaxed text-muted-foreground">{section.text}</p>
          </section>
        ))}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/jouer"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            {a.playCta}
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:border-primary/40"
          >
            {a.contactCta}
          </Link>
        </div>
      </article>
    </PageLayout>
  )
}
