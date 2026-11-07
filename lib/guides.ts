import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

import type { Locale } from "@/lib/i18n/dictionaries"

/**
 * Guides des techniques de base (content/techniques/*.md en français, content/techniques/en/*.md en anglais).
 * L'identifiant de page est celui du fichier français ; l'anglais utilise son propre nom (naked-single…).
 * ⚠️ Utilise node:fs — à n'appeler que depuis un composant serveur.
 */
const DIR = path.join(process.cwd(), "content", "techniques")

export const GUIDE_FR_SLUGS = ["candidat-unique", "paires-nues", "pointage", "paires-cachees"] as const
export type GuideSlug = (typeof GUIDE_FR_SLUGS)[number]

const EN_SLUG: Record<GuideSlug, string> = {
  "candidat-unique": "naked-single",
  "paires-nues": "naked-pairs",
  pointage: "pointing-pairs",
  "paires-cachees": "hidden-pairs",
}

/** Identifiant de l'adresse (/techniques/<slug>) selon la langue. */
export function guideSlug(fr: GuideSlug, locale: Locale): string {
  return locale === "fr" ? fr : EN_SLUG[fr]
}

/** Retrouve le guide à partir de l'identifiant d'adresse (français ou anglais selon la langue de la page). */
export function resolveGuide(slug: string, locale: Locale): GuideSlug | null {
  return GUIDE_FR_SLUGS.find((fr) => guideSlug(fr, locale) === slug) ?? null
}

export interface Guide {
  slug: GuideSlug
  title: string
  seoTitle: string
  description: string
  level: string
  next?: GuideSlug
  content: string
}

export function getGuide(slug: GuideSlug, locale: Locale): Guide {
  const file = locale === "fr" ? path.join(DIR, `${slug}.md`) : path.join(DIR, "en", `${EN_SLUG[slug]}.md`)
  const { data, content } = matter(fs.readFileSync(file, "utf-8"))
  return {
    slug,
    title: String(data.title ?? slug),
    seoTitle: String(data.seoTitle ?? data.title ?? slug),
    description: String(data.description ?? ""),
    level: String(data.level ?? ""),
    next: GUIDE_FR_SLUGS.find((s) => s === data.next),
    content,
  }
}
