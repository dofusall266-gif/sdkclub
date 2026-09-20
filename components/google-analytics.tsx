"use client"

import Script from "next/script"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/**
 * Charge Google Analytics (gtag.js) si l'identifiant de mesure (NEXT_PUBLIC_GA_ID)
 * est configuré. Le respect du consentement est géré par Google Consent Mode v2
 * (voir app/layout.tsx + le bandeau CMP configuré dans AdSense) : tant que
 * l'utilisateur n'a pas accepté, aucun cookie analytics n'est réellement posé,
 * même si ce script est chargé.
 */
export function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
