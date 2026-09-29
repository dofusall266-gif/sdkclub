"use client"

import { Mail } from "lucide-react"
import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { useLanguage } from "@/lib/i18n/context"

const YOUTUBE_URL = "https://www.youtube.com/@StudyMd667"

export function AboutContent() {
  const { t } = useLanguage()
  const a = t.about

  return (
    <PageLayout>
      <article className="max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{a.title}</h1>
          <p className="mt-4 leading-relaxed text-muted-foreground">{a.intro}</p>
        </header>

        {a.sections.map((section, index) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-xl font-bold tracking-tight">{section.title}</h2>
            <p className="leading-relaxed text-muted-foreground">{section.text}</p>
            {index === 1 && (
              <a
                href={YOUTUBE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
                </svg>
                {a.youtubeLinkLabel}
              </a>
            )}
          </section>
        ))}

        <section className="rounded-2xl border border-border bg-secondary/30 p-6">
          <h2 className="text-lg font-bold">{a.contactHeading}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{a.contactText}</p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            <Mail className="size-4" />
            {a.contactLinkLabel}
          </Link>
        </section>
      </article>
    </PageLayout>
  )
}
