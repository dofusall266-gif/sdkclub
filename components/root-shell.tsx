import { Analytics } from "@vercel/analytics/next"
import Script from "next/script"
import { Suspense } from "react"

import { CookieConsent } from "@/components/cookie-consent"
import { GoogleAnalytics } from "@/components/google-analytics"
import { PwaRegister } from "@/components/pwa-register"
import { SourceCapture } from "@/components/source-capture"
import { VisitTimer } from "@/components/visit-timer"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/lib/i18n/context"
import type { Locale } from "@/lib/i18n/dictionaries"

/**
 * Coquille commune à toutes les pages (balise <html>, scripts de consentement et de pub, en-tête, pied de page).
 * Utilisée par app/(fr)/layout.tsx (français, adresses à la racine) et app/en/layout.tsx (anglais, adresses /en/…).
 */
export function RootShell({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  return (
    <html lang={lang} suppressHydrationWarning>
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
        <LanguageProvider locale={lang}>
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
            <SourceCapture />
            <VisitTimer />
          </ThemeProvider>
        </LanguageProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
