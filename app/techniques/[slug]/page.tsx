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
  return <TechniquePage slug={slug as TechSlug} />
}
