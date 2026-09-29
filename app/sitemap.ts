import type { MetadataRoute } from "next"

import { getAllPosts } from "@/lib/blog"

const SITE_URL = "https://sudoku-club.com"

// Plan du site pour Google : généré automatiquement, les nouveaux articles de
// content/blog/ y sont ajoutés sans rien toucher. Disponible sur /sitemap.xml.
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: Array<{ path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" | "yearly" }> = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/jouer", priority: 0.9, changeFrequency: "monthly" },
    { path: "/defi", priority: 0.9, changeFrequency: "daily" },
    { path: "/regles", priority: 0.8, changeFrequency: "monthly" },
    { path: "/techniques", priority: 0.8, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/qui-sommes-nous", priority: 0.5, changeFrequency: "yearly" },
    { path: "/contact", priority: 0.4, changeFrequency: "yearly" },
    { path: "/politique-de-confidentialite", priority: 0.2, changeFrequency: "yearly" },
    { path: "/mentions-legales", priority: 0.2, changeFrequency: "yearly" },
  ]

  const staticEntries = pages.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  const postEntries = getAllPosts().map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(`${post.date}T00:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  return [...staticEntries, ...postEntries]
}
