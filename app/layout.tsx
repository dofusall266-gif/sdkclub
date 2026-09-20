import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Suspense } from "react"

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
      <head>
        {/*
          Google Consent Mode v2 : par défaut, tout est refusé (aucun cookie pub/analytics
          n'est posé) tant que l'utilisateur n'a pas répondu au bandeau de consentement
          Google (configuré dans AdSense > Confidentialité et messages). Ce bandeau met
          ensuite ce signal à jour automatiquement via gtag('consent', 'update', ...).
        */}
        <Script id="consent-default" strategy="beforeInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'ad_storage': 'denied',
              'ad_user_data': 'denied',
              'ad_personalization': 'denied',
              'analytics_storage': 'denied'
            });
          `}
        </Script>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5508634102948480"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
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
            <GoogleAnalytics />
          </ThemeProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
