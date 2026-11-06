"use client"

import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { Trainer } from "@/components/training/trainer"
import { TrainingBoard } from "@/components/training/training-board"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { LESSONS, TECH_SLUGS, type TechSlug } from "@/lib/training-lessons"
import { TRAINING_CASES } from "@/lib/training-cases"
import { decodeCase, explainPattern } from "@/lib/training"

/** Page d'une technique : leçon illustrée, exemple sur une vraie grille, puis exercice interactif. */
export function TechniquePage({ slug }: { slug: TechSlug }) {
  const { t, locale } = useLanguage()
  const lesson = LESSONS[slug]
  const text = lesson[locale]
  const tr = t.training

  // Le premier cas de chaque technique est choisi pour être lisible : un seul motif, peu d'éliminations.
  const example = decodeCase(TRAINING_CASES[lesson.tech][0])
  const pattern = example.patterns[0]

  return (
    <PageLayout>
      <article className="space-y-10">
        <header>
          <Link href="/techniques" className="text-sm text-muted-foreground hover:text-foreground">
            {tr.back}
          </Link>
          <span className="mt-4 block w-fit rounded-full bg-destructive/12 px-2.5 py-0.5 text-xs font-semibold text-destructive">{tr.level}</span>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{text.name}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{text.tagline}</p>
          <p className="mt-4 max-w-3xl leading-relaxed">{text.intro}</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lesson.art}
            alt={lesson.artAlt[locale]}
            width={1200}
            height={630}
            fetchPriority="high"
            className="mt-6 w-full max-w-3xl rounded-2xl border border-border"
          />
        </header>

        <section>
          <h2 className="text-xl font-bold">{tr.exampleHeading}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{tr.exampleIntro}</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,36rem)_1fr]">
            <TrainingBoard dc={example} reveal={pattern} focusDigits={slug === "y-wing" ? [] : [pattern.d]} readOnly />
            <div className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="size-4 rounded bg-primary/30 ring-1 ring-primary" /> {tr.legendPattern}
                </li>
                <li className="flex items-center gap-2">
                  <span className="grid size-4 place-items-center rounded-full bg-destructive/20 text-[0.6rem] font-bold text-destructive line-through">{pattern.d}</span> {tr.legendElim}
                </li>
                {slug !== "y-wing" && (
                  <li className="flex items-center gap-2">
                    <span className="size-4 rounded bg-primary/10 ring-1 ring-border" /> {tr.legendLines}
                  </li>
                )}
                {slug !== "y-wing" && (
                  <li className="flex items-center gap-2">
                    <span className="grid size-4 place-items-center text-[0.7rem] font-semibold text-foreground/80">{pattern.d}</span> {tr.legendOther(pattern.d)}
                  </li>
                )}
              </ul>
              <p className="text-sm leading-relaxed">{explainPattern(lesson.tech, pattern, example, locale)}</p>
              <p className="text-xs text-muted-foreground">{tr.notation}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">{tr.stepsHeading}</h2>
          <ol className="mt-4 grid gap-4 sm:grid-cols-2">
            {text.steps.map((step, i) => (
              <li key={step.title} className="rounded-2xl border border-border bg-card p-5">
                <span className="grid size-7 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">{i + 1}</span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="-mx-4 border-y border-border bg-secondary/30 px-2 py-4 sm:mx-0 sm:rounded-2xl sm:border sm:p-6">
          <h2 className="px-2 text-xl font-bold sm:px-0">{tr.trainerHeading}</h2>
          <p className="mt-1 mb-5 px-2 text-sm text-muted-foreground sm:px-0">{tr.trainerIntro}</p>
          <Trainer tech={lesson.tech} task={text.task} />
        </section>

        <section>
          <h2 className="text-xl font-bold">{tr.mistakesHeading}</h2>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {text.mistakes.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold">{tr.faqHeading}</h2>
          <div className="mt-3 space-y-4">
            {text.faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold">{tr.otherTechniques}</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {TECH_SLUGS.filter((s) => s !== slug).map((s) => (
              <Link key={s} href={`/techniques/${s}`} className={buttonVariants({ variant: "outline" })}>
                {LESSONS[s][locale].name}
              </Link>
            ))}
            {lesson.article && (
              <Link href={`/blog/${lesson.article}`} className={buttonVariants({ variant: "outline" })}>
                {tr.articleLink}
              </Link>
            )}
            <Link href="/" className={buttonVariants()}>
              {tr.playCta}
            </Link>
          </div>
        </section>
      </article>
    </PageLayout>
  )
}
