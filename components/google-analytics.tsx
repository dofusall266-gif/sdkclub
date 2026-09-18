"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

import { CONSENT_EVENT, type ConsentValue, getConsent } from "@/lib/consent"

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

/**
 * Charge Google Analytics (gtag.js) uniquement si :
 * 1. L'identifiant de mesure (NEXT_PUBLIC_GA_ID) est configuré, ET
 * 2. L'utilisateur a accepté les cookies.
 * Réagit en direct au changement de consentement (pas besoin de recharger la page).
 */
export function GoogleAnalytics() {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    if (!GA_ID) return
    setEnabled(getConsent() === "accepted")

    const onChange = (e: Event) => {
      const value = (e as CustomEvent<ConsentValue>).detail
      setEnabled(value === "accepted")
    }
    window.addEventListener(CONSENT_EVENT, onChange)
    return () => window.removeEventListener(CONSENT_EVENT, onChange)
  }, [])

  if (!GA_ID || !enabled) return null

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
