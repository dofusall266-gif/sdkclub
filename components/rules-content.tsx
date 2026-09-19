"use client"

import { Check, Grid3x3, Rows3, Square } from "lucide-react"
import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"

const ICONS = [Rows3, Grid3x3, Square]

// ID de la vidéo YouTube extrait de https://www.youtube.com/watch?v=V5KPwFRVl3U
const YOUTUBE_VIDEO_ID = "V5KPwFRVl3U"

export function RulesContent() {
  const { t } = useLanguage()
  const r = t.rules

  return (
    <PageLayout>
      <article className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{r.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{r.intro}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {r.rulesList.map((rule, i) => {
            const Icon = ICONS[i]
            return (
              <div key={rule.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <Icon className="size-5" />
                </div>
                <h2 className="mt-4 text-lg font-semibold">{rule.title}</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">{rule.text}</p>
              </div>
            )
          })}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">{r.videoHeading}</h2>
          <p className="text-muted-foreground">{r.videoText}</p>
          <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
            <iframe
              className="size-full"
              src={`https://www.youtube-nocookie.com/embed/${YOUTUBE_VIDEO_ID}`}
              title={r.videoHeading}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">{r.startHeading}</h2>
          <ol className="space-y-3">
            {r.startSteps.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-secondary/40 p-6">
          <h2 className="text-xl font-bold">{r.tipsHeading}</h2>
          <ul className="mt-4 space-y-2.5">
            {r.tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            {r.ctaPlay}
          </Link>
          <Link href="/techniques" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {r.ctaTechniques}
          </Link>
        </div>
      </article>
    </PageLayout>
  )
}
