"use client"

import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"

const LEVEL_STYLES: Record<string, string> = {
  Débutant: "bg-primary/12 text-primary",
  Beginner: "bg-primary/12 text-primary",
  Intermédiaire: "bg-chart-4/20 text-chart-4",
  Intermediate: "bg-chart-4/20 text-chart-4",
  Avancé: "bg-destructive/12 text-destructive",
  Advanced: "bg-destructive/12 text-destructive",
}

export function TechniquesContent() {
  const { t } = useLanguage()
  const tech = t.techniques

  return (
    <PageLayout>
      <article className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tech.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{tech.intro}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {tech.items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card p-6">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLES[item.level] ?? ""}`}
              >
                {item.level}
              </span>
              <h2 className="mt-3 text-lg font-semibold">{item.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-secondary/40 p-6">
          <h2 className="text-xl font-bold">{tech.notesHeading}</h2>
          <p className="mt-3 text-muted-foreground">{tech.notesText}</p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            {tech.ctaPractice}
          </Link>
          <Link href="/regles" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {tech.ctaRules}
          </Link>
        </div>
      </article>
    </PageLayout>
  )
}
