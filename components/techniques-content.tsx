"use client"

import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { LESSONS, TECH_SLUGS } from "@/lib/training-lessons"

const LEVEL_STYLES: Record<string, string> = {
  Débutant: "bg-primary/12 text-primary",
  Beginner: "bg-primary/12 text-primary",
  Intermédiaire: "bg-chart-4/20 text-chart-4",
  Intermediate: "bg-chart-4/20 text-chart-4",
  Avancé: "bg-destructive/12 text-destructive",
  Advanced: "bg-destructive/12 text-destructive",
}

export function TechniquesContent() {
  const { t, locale } = useLanguage()
  const tech = t.techniques

  return (
    <PageLayout>
      <article className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{tech.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{tech.intro}</p>
        </header>

        <section aria-labelledby="practice-title" className="rounded-3xl border border-primary/30 bg-primary/5 p-5 sm:p-7">
          <h2 id="practice-title" className="text-2xl font-bold tracking-tight">
            {t.training.practiceHeading}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t.training.practiceIntro}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {TECH_SLUGS.map((slug) => {
              const lesson = LESSONS[slug]
              return (
                <Link
                  key={slug}
                  href={`/techniques/${slug}`}
                  className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={lesson.art}
                    alt={lesson.artAlt[locale]}
                    width={1200}
                    height={630}
                    loading="lazy"
                    className="w-full rounded-xl border border-border"
                  />
                  <span className="mt-4 w-fit rounded-full bg-destructive/12 px-2.5 py-0.5 text-xs font-semibold text-destructive">
                    {t.training.level}
                  </span>
                  <h3 className="mt-2 text-xl font-bold group-hover:text-primary">{lesson[locale].name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{lesson[locale].summary}</p>
                  <span className="mt-4 inline-flex w-fit items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
                    {t.training.practiceCta} →
                  </span>
                </Link>
              )
            })}
          </div>
        </section>

        <h2 className="pt-4 text-xl font-bold">{t.training.basicsHeading}</h2>
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
