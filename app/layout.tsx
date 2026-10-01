import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Suspense } from "react"

import { CookieConsent } from "@/components/cookie-consent"
import { GoogleAnalytics } from "@/components/google-analytics"
import { PwaRegister } from "@/components/pwa-register"
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
  // Aperçu de lien (X, WhatsApp, Discord…) : les robots ne lisent pas le
  // sélecteur de langue, donc titre/description bilingues ici. L'image est
  // générée par app/opengraph-image.tsx et app/twitter-image.tsx.
  openGraph: {
    type: "website",
    locale: "fr_FR",
    alternateLocale: ["en_US"],
    siteName: "Sudoku Club",
    title: "Sudoku Club — Free online Sudoku · Sudoku gratuit en ligne",
    description:
      "Play free Sudoku online: unlimited puzzles, 4 difficulty levels, daily challenge, no sign-up. Jouez au sudoku gratuitement en ligne.",
  },
  appleWebApp: { capable: true, title: "Sudoku Club" },
  twitter: {
    card: "summary_large_image",
    title: "Sudoku Club — Free online Sudoku · Sudoku gratuit en ligne",
    description:
      "Play free Sudoku online: unlimited puzzles, 4 difficulty levels, daily challenge, no sign-up. Jouez au sudoku gratuitement en ligne.",
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EDE0CE" },
    { media: "(prefers-color-scheme: dark)", color: "#1E140F" },
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
          n'est réellement posé) tant que l'utilisateur n'a pas répondu à NOTRE bandeau
          (components/cookie-consent.tsx, affiché ci-dessous). C'est ce bandeau, et lui
          seul, qui met ce signal à jour via gtag('consent', 'update', ...) — voir
          lib/consent.ts. Important : si un bandeau de consentement Google est activé
          dans AdSense > Confidentialité et messages, désactivez-le pour éviter d'en
          afficher deux aux visiteurs.
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
            <CookieConsent />
            <PwaRegister />
          </ThemeProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
