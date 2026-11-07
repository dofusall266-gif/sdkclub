import type { Metadata, Viewport } from "next"

import { RootShell } from "@/components/root-shell"
import "../globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://sudoku-club.com"),
  title: {
    default: "Sudoku-Club — Free online Sudoku, daily challenge",
    template: "%s | Sudoku-Club",
  },
  description:
    "Play free Sudoku online, no sign-up: 6 difficulty levels from Easy to Crazy, a ranked daily challenge and printable PDF puzzles.",
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["fr_FR"],
    siteName: "Sudoku-Club",
    title: "Sudoku-Club — Free online Sudoku",
    description: "Play free Sudoku online: unlimited puzzles, 6 difficulty levels, daily challenge, no sign-up.",
  },
  appleWebApp: { capable: true, title: "Sudoku-Club" },
  twitter: {
    card: "summary_large_image",
    title: "Sudoku-Club — Free online Sudoku",
    description: "Play free Sudoku online: unlimited puzzles, 6 difficulty levels, daily challenge, no sign-up.",
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDE0CE" },
    { media: "(prefers-color-scheme: dark)", color: "#1E140F" },
  ],
}

export default function EnglishLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RootShell lang="en">{children}</RootShell>
}
