import type { Metadata } from "next"

import { GamePageLayout } from "@/components/game-page-layout"
import Link from "@/components/localized-link"
import { SudokuGame } from "@/components/sudoku/sudoku-game"
import { buttonVariants } from "@/components/ui/button"
import { dictionaries, type Locale } from "@/lib/i18n/dictionaries"
import { SITE_URL, localizePath, pageAlternates } from "@/lib/i18n/paths"
import { LEVEL_PAGES } from "@/lib/level-pages"
import { DIFFICULTIES, type Difficulty } from "@/lib/sudoku"

const frPath = (level: Difficulty) => `/sudoku-${level}`

export function levelMetadata(level: Difficulty, locale: Locale): Metadata {
  const text = LEVEL_PAGES[level][locale]
  return {
    title: text.metaTitle,
    description: text.metaDescription,
    alternates: pageAlternates(frPath(level), locale),
  }
}

export function LevelView({ level, locale }: { level: Difficulty; locale: Locale }) {
  const page = LEVEL_PAGES[level]
  const text = page[locale]
  const isFr = locale === "fr"
  const labels = dictionaries[locale].game.difficulties
  const url = `${SITE_URL}${localizePath(frPath(level), locale)}`

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isFr ? "Accueil" : "Home", item: `${SITE_URL}${localizePath("/", locale) === "/" ? "" : localizePath("/", locale)}` },
      { "@type": "ListItem", position: 2, name: text.h1, item: url },
    ],
  }
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: isFr ? "fr-FR" : "en",
    mainEntity: text.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }

  return (
    <GamePageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />

      <header className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{text.h1}</h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">{text.lead}</p>
      </header>

      <SudokuGame initialDifficulty={level} forceDifficulty={level} />

      <div className="mt-12 space-y-8 border-t border-border pt-8">
        <dl className="max-w-xs rounded-2xl border border-border bg-card p-5">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{isFr ? "Chiffres de départ" : "Starting digits"}</dt>
          <dd className="mt-1 text-lg font-semibold">{page.clues[0]} – {page.clues[1]} / 81</dd>
        </dl>

        {text.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-xl font-bold">{s.h}</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">{s.p}</p>
          </section>
        ))}

        <section>
          <h2 className="text-xl font-bold">{isFr ? "Techniques utiles à ce niveau" : "Useful techniques at this level"}</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
            {text.techniques.map((t) => (
              <li key={t.href}>
                <Link href={t.href} className="font-semibold text-foreground underline-offset-4 hover:underline">
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold">{isFr ? "Questions fréquentes" : "Frequently asked questions"}</h2>
          <div className="mt-3 space-y-4">
            {text.faq.map((f) => (
              <div key={f.q}>
                <h3 className="font-semibold">{f.q}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <nav aria-label={isFr ? "Autres niveaux" : "Other levels"}>
          <h2 className="text-xl font-bold">{isFr ? "Les autres niveaux" : "The other levels"}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIFFICULTIES.filter((d) => d !== level).map((d) => (
              <Link key={d} href={frPath(d)} className={buttonVariants({ variant: "outline", size: "sm" })}>
                {labels[d]}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </GamePageLayout>
  )
}
