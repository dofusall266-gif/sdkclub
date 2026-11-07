import { BlogTeaser } from "@/components/blog-teaser"
import { DailyBanner } from "@/components/daily-banner"
import { GamePageLayout } from "@/components/game-page-layout"
import { HomeSeoContent } from "@/components/home-seo-content"
import { SudokuGame } from "@/components/sudoku/sudoku-game"
import { getAllPosts } from "@/lib/blog"
import type { Locale } from "@/lib/i18n/dictionaries"
import { SITE_URL, localizePath } from "@/lib/i18n/paths"

// Données structurées : décrivent le site, l'organisation et le jeu à Google.
function buildJsonLd(locale: Locale) {
  const url = `${SITE_URL}${localizePath("/", locale) === "/" ? "" : localizePath("/", locale)}`
  return {
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
        url,
        applicationCategory: "GameApplication",
        operatingSystem: locale === "fr" ? "Tous (navigateur web)" : "Any (web browser)",
        description:
          locale === "fr"
            ? "Sudoku gratuit en ligne, sans inscription : 6 niveaux de difficulté, défi du jour classé et grilles à imprimer en PDF."
            : "Free online Sudoku, no sign-up: 6 difficulty levels, a ranked daily challenge and printable PDF puzzles.",
        inLanguage: locale === "fr" ? "fr-FR" : "en",
        offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      },
    ],
  }
}

export function HomeView({ locale }: { locale: Locale }) {
  const latestPosts = getAllPosts().slice(0, 3)
  return (
    <GamePageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }} />
      <DailyBanner />
      <SudokuGame />
      <HomeSeoContent />
      <BlogTeaser posts={latestPosts} />
    </GamePageLayout>
  )
}
