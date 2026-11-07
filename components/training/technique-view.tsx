import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { TechniquePage } from "@/components/training/technique-page"
import type { Locale } from "@/lib/i18n/dictionaries"
import { SITE_URL, localizePath, pageAlternates } from "@/lib/i18n/paths"
import { LESSONS, type TechSlug } from "@/lib/training-lessons"

export function techniqueMetadata(slug: string, locale: Locale): Metadata {
  const lesson = LESSONS[slug as TechSlug]
  if (!lesson) return {}
  const meta = locale === "fr" ? { title: lesson.metaTitle, description: lesson.metaDescription } : lesson.metaEn
  return { ...meta, alternates: pageAlternates(`/techniques/${slug}`, locale) }
}

export function TechniqueView({ slug, locale }: { slug: string; locale: Locale }) {
  if (!(slug in LESSONS)) notFound()
  const lesson = LESSONS[slug as TechSlug]
  const text = lesson[locale]
  const page = (p: string) => `${SITE_URL}${localizePath(p, locale)}`
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: locale === "fr" ? "Accueil" : "Home", item: page("/") },
      { "@type": "ListItem", position: 2, name: "Techniques", item: page("/techniques") },
      { "@type": "ListItem", position: 3, name: text.name, item: page(`/techniques/${slug}`) },
    ],
  }
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: locale === "fr" ? "fr-FR" : "en",
    mainEntity: text.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
      <TechniquePage slug={slug as TechSlug} />
    </>
  )
}
