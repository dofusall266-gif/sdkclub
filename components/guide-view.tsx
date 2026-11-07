import { marked } from "marked"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import Link from "@/components/localized-link"
import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"
import { getGuide, guideSlug, resolveGuide } from "@/lib/guides"
import type { Locale } from "@/lib/i18n/dictionaries"
import { SITE_URL, localizeHtmlLinks, localizePath, pageAlternates } from "@/lib/i18n/paths"

const LEVEL_STYLE: Record<string, string> = {
  Débutant: "bg-primary/12 text-primary",
  Beginner: "bg-primary/12 text-primary",
  Intermédiaire: "bg-chart-4/20 text-chart-4",
  Intermediate: "bg-chart-4/20 text-chart-4",
  Avancé: "bg-destructive/12 text-destructive",
  Advanced: "bg-destructive/12 text-destructive",
}

export function guideMetadata(slug: string, locale: Locale): Metadata {
  const fr = resolveGuide(slug, locale)
  if (!fr) return {}
  const g = getGuide(fr, locale)
  return { title: g.seoTitle, description: g.description, alternates: pageAlternates(`/techniques/${fr}`, locale) }
}

export function GuideView({ slug, locale }: { slug: string; locale: Locale }) {
  const fr = resolveGuide(slug, locale)
  if (!fr) notFound()
  const g = getGuide(fr, locale)
  const html = localizeHtmlLinks(marked.parse(g.content, { async: false }) as string, locale)
  const url = `${SITE_URL}${localizePath(`/techniques/${fr}`, locale)}`
  const isFr = locale === "fr"

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isFr ? "Accueil" : "Home", item: `${SITE_URL}${localizePath("/", locale) === "/" ? "" : localizePath("/", locale)}` },
      { "@type": "ListItem", position: 2, name: "Techniques", item: `${SITE_URL}${localizePath("/techniques", locale)}` },
      { "@type": "ListItem", position: 3, name: g.title, item: url },
    ],
  }
  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: g.title,
    description: g.description,
    inLanguage: isFr ? "fr-FR" : "en",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Sudoku-Club", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Sudoku-Club", url: SITE_URL },
  }
  const next = g.next ? getGuide(g.next, locale) : null

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(article) }} />
      <article className="mx-auto max-w-[42rem]">
        <Link href="/techniques" className="text-sm text-muted-foreground hover:text-foreground">
          {isFr ? "← Toutes les techniques" : "← All techniques"}
        </Link>
        <header className="mt-4 mb-8">
          {g.level && (
            <span className={`mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLE[g.level] ?? ""}`}>
              {g.level}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{g.title}</h1>
        </header>

        <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            {isFr ? "Mettre en pratique" : "Put it into practice"}
          </Link>
          {next && (
            <Link
              href={`/techniques/${guideSlug(next.slug, "fr")}`}
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              {isFr ? "Technique suivante : " : "Next technique: "}
              {next.title.length > 40 ? next.seoTitle : next.title}
            </Link>
          )}
        </div>
      </article>
    </PageLayout>
  )
}
