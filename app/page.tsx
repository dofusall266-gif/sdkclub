import type { Metadata } from "next"

import { BlogTeaser } from "@/components/blog-teaser"
import { GamePageLayout } from "@/components/game-page-layout"
import { DailyBanner } from "@/components/daily-banner"
import { HomeSeoContent } from "@/components/home-seo-content"
import { SudokuGame } from "@/components/sudoku/sudoku-game"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Sudoku-Club — Jouer au sudoku gratuit, défi du jour",
  description:
    "Jouez au sudoku gratuit en ligne, sans inscription : 6 niveaux du Facile au Fou, un défi du jour classé et des grilles à imprimer en PDF.",
  alternates: { canonical: "/" },
}

const SITE_URL = "https://sudoku-club.com"

// Données structurées : décrivent le site, l'organisation et le jeu à Google.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Sudoku-Club",
      inLanguage: ["fr-FR", "en"],
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Sudoku-Club",
      url: SITE_URL,
      logo: `${SITE_URL}/icons/icon-512.png`,
      email: "contact@sudoku-club.com",
    },
    {
      "@type": "WebApplication",
      name: "Sudoku-Club",
      url: SITE_URL,
      applicationCategory: "GameApplication",
      operatingSystem: "Any (navigateur web)",
      description:
        "Sudoku gratuit en ligne, sans inscription : 6 niveaux de difficulté, défi du jour classé et grilles à imprimer en PDF.",
      inLanguage: "fr-FR",
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
    },
  ],
}

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 3)

  return (
    <GamePageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <DailyBanner />
      <SudokuGame />
      <HomeSeoContent />
      <BlogTeaser posts={latestPosts} />
    </GamePageLayout>
  )
}
