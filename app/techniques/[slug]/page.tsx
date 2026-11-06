import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { TechniquePage } from "@/components/training/technique-page"
import { LESSONS, TECH_SLUGS, type TechSlug } from "@/lib/training-lessons"

export function generateStaticParams() {
  return TECH_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const lesson = LESSONS[slug as TechSlug]
  if (!lesson) return {}
  return {
    title: lesson.metaTitle,
    description: lesson.metaDescription,
    alternates: { canonical: `/techniques/${slug}` },
  }
}

export default async function TechniqueRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!(slug in LESSONS)) notFound()
  const lesson = LESSONS[slug as TechSlug]
  const base = "https://sudoku-club.com"
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: base },
      { "@type": "ListItem", position: 2, name: "Techniques", item: `${base}/techniques` },
      { "@type": "ListItem", position: 3, name: lesson.fr.name, item: `${base}/techniques/${slug}` },
    ],
  }
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: lesson.fr.faq.map((f) => ({
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
