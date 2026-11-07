import type { Metadata } from "next"

import { GuideView, guideMetadata } from "@/components/guide-view"
import { TechniqueView, techniqueMetadata } from "@/components/training/technique-view"
import { GUIDE_FR_SLUGS, guideSlug } from "@/lib/guides"
import { TECH_SLUGS } from "@/lib/training-lessons"

const isLesson = (slug: string) => (TECH_SLUGS as readonly string[]).includes(slug)

export function generateStaticParams() {
  return [
    ...TECH_SLUGS.map((slug) => ({ slug })),
    ...GUIDE_FR_SLUGS.map((fr) => ({ slug: guideSlug(fr, "en") })),
  ]
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return isLesson(slug) ? techniqueMetadata(slug, "en") : guideMetadata(slug, "en")
}

export default async function TechniqueRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return isLesson(slug) ? <TechniqueView slug={slug} locale="en" /> : <GuideView slug={slug} locale="en" />
}
