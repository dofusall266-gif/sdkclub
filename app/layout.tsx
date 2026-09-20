import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"

import { CookieConsent } from "@/components/cookie-consent"
import { GoogleAnalytics } from "@/components/google-analytics"
import { LanguageProvider } from "@/lib/i18n/context"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://sudoku-club.com"),
  title: {
    default: "Sudoku Club — Jouer au sudoku gratuit en ligne",
    template: "%s | Sudoku Club",
  },
  description:
    "Jouez au sudoku gratuitement en ligne : grilles uniques, 4 niveaux de difficulté, minuteur, indices et impression PDF. Optimisé pour mobile.",
  keywords: ["sudoku", "sudoku en ligne", "sudoku gratuit", "jeu de sudoku", "grille de sudoku", "sudoku à imprimer"],
  generator: "v0.app",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Sudoku Club",
    title: "Sudoku Club — Jouer au sudoku gratuit en ligne",
    description:
      "Jouez au sudoku gratuitement en ligne : grilles uniques, 4 niveaux de difficulté, minuteur, indices et impression PDF.",
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#22242e" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">
        <LanguageProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex min-h-dvh flex-col">
              <Suspense fallback={null}>
                <SiteHeader />
              </Suspense>
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <CookieConsent />
            <GoogleAnalytics />
          </ThemeProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
