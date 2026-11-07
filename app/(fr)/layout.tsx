import type { Metadata, Viewport } from "next"

import { RootShell } from "@/components/root-shell"
import "../globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://sudoku-club.com"),
  title: {
    default: "Sudoku-Club — Jouer au sudoku gratuit, défi du jour",
    template: "%s | Sudoku-Club",
  },
  description:
    "Jouez au sudoku gratuit en ligne, sans inscription : 6 niveaux du Facile au Fou, un défi du jour classé et des grilles à imprimer en PDF.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    siteName: "Sudoku-Club",
    title: "Sudoku-Club — Jouer au sudoku gratuit en ligne",
    description:
      "Jouez au sudoku gratuitement en ligne : grilles illimitées, 6 niveaux de difficulté, défi du jour, sans inscription.",
  },
  appleWebApp: { capable: true, title: "Sudoku-Club" },
  twitter: {
    card: "summary_large_image",
    title: "Sudoku-Club — Jouer au sudoku gratuit en ligne",
    description:
      "Jouez au sudoku gratuitement en ligne : grilles illimitées, 6 niveaux de difficulté, défi du jour, sans inscription.",
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDE0CE" },
    { media: "(prefers-color-scheme: dark)", color: "#1E140F" },
  ],
}

export default function FrenchLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="fr">{children}</RootShell>
}
