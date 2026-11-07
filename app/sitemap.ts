import type { MetadataRoute } from "next"

import { getAllPosts } from "@/lib/blog"
import { SITE_URL, localizePath } from "@/lib/i18n/paths"

// Plan du site pour Google : généré automatiquement, les nouveaux articles de
// content/blog/ y sont ajoutés sans rien toucher. Disponible sur /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly"; lastModified?: string }> = [
    { path: "/", priority: 1, changeFrequency: "weekly", lastModified: "2026-11-06" },
    { path: "/defi", priority: 0.9, changeFrequency: "daily" },
    { path: "/regles", priority: 0.8, changeFrequency: "monthly" },
    { path: "/techniques", priority: 0.8, changeFrequency: "monthly" },
    { path: "/techniques/x-wing", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-11-06" },
    { path: "/techniques/y-wing", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-11-06" },
    { path: "/techniques/swordfish", priority: 0.7, changeFrequency: "monthly", lastModified: "2026-11-06" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/qui-sommes-nous", priority: 0.5, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/politique-de-confidentialite", priority: 0.2, changeFrequency: "yearly" },
    { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" },
  ]

  // Chaque page existe en français et en anglais : les deux entrées se référencent (hreflang),
  // pour que Google affiche la bonne langue à la bonne personne.
  const both = (frPath: string, rest: { lastModified?: Date; changeFrequency: "daily" | "weekly" | "monthly" | "yearly"; priority: number }) => {
    const languages = { fr: `${SITE_URL}${frPath}`, en: `${SITE_URL}${localizePath(frPath, "en")}` }
    return [
      { url: languages.fr, ...rest, alternates: { languages } },
      { url: languages.en, ...rest, alternates: { languages } },
    ]
  }

  const levelPages = ["facile", "moyen", "difficile", "expert", "diabolique", "fou"].map((l) => ({
    path: `/sudoku-${l}`,
    priority: 0.8,
    changeFrequency: "monthly" as const,
    lastModified: "2026-11-07",
  }))
  const guidePages = ["candidat-unique", "paires-nues", "pointage", "paires-cachees"].map((g) => ({
    path: `/techniques/${g}`,
    priority: 0.7,
    changeFrequency: "monthly" as const,
    lastModified: "2026-11-07",
  }))

  const staticEntries = [...pages, ...levelPages, ...guidePages].flatMap((p) =>
    both(p.path, {
      ...(p.lastModified ? { lastModified: new Date(`${p.lastModified}T00:00:00Z`) } : {}),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    }),
  )

  const postEntries = getAllPosts().flatMap((post) => {
    const rest = {
      lastModified: new Date(`${post.updated ?? post.date}T00:00:00Z`),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }
    if (!post.en) return [{ url: `${SITE_URL}/blog/${post.slug}`, ...rest }]
    return both(`/blog/${post.slug}`, rest)
  })

  return [...staticEntries, ...postEntries]
}
