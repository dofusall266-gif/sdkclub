// Types et utilitaires purs (sans accès disque), pour pouvoir les importer
// depuis des composants client sans jamais entraîner node:fs dans le bundle
// navigateur. Les fonctions qui lisent réellement les fichiers vivent dans
// lib/blog.ts (composants serveur uniquement).

export interface BlogTexts {
  title: string
  excerpt: string
  category: string
}

export interface BlogPostMeta extends BlogTexts {
  slug: string
  date: string // YYYY-MM-DD
  /** Traduction anglaise (content/blog/en/<slug>.md), si elle existe. */
  en?: BlogTexts
}

export interface BlogPost extends BlogPostMeta {
  content: string
  /** Contenu anglais complet, si la traduction existe. */
  enContent?: string
}

/** Textes à afficher selon la langue, avec repli sur le français. */
export function localizedTexts(post: BlogPostMeta, locale: "fr" | "en"): BlogTexts {
  return locale === "en" && post.en ? post.en : post
}

export function formatBlogDate(dateStr: string, locale: "fr" | "en"): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}
