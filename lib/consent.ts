export const CONSENT_KEY = "sudokuclub-cookie-consent"
export const CONSENT_EVENT = "sc-consent-change"

export type ConsentValue = "accepted" | "refused"

declare global {
  interface Window {
    // Défini par le script "consent-default" dans app/layout.tsx (Consent Mode v2).
    gtag?: (...args: unknown[]) => void
  }
}

export function getConsent(): ConsentValue | null {
  try {
    return localStorage.getItem(CONSENT_KEY) as ConsentValue | null
  } catch {
    return null
  }
}

/** Met à jour le signal Google Consent Mode v2 (Analytics + Ads) selon le
 * choix du visiteur. C'est ce signal, et lui seul, qui détermine si Google
 * pose réellement des cookies analytics/pub — voir app/layout.tsx pour le
 * réglage par défaut ("denied" tant que rien n'a été choisi). */
function applyConsentSignal(value: ConsentValue) {
  if (typeof window === "undefined" || !window.gtag) return
  const granted = value === "accepted"
  window.gtag("consent", "update", {
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
    analytics_storage: granted ? "granted" : "denied",
  })
}

export function setConsent(value: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // localStorage indisponible : on continue quand même, juste sans mémorisation.
  }
  applyConsentSignal(value)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
  }
}

/** À appeler une fois au chargement du site : réapplique le choix déjà fait
 * par un visiteur revenu sur le site (sinon Consent Mode repart à "denied"
 * par défaut à chaque page, et un visiteur ayant déjà accepté serait quand
 * même compté comme refusant). */
export function reapplyStoredConsent() {
  const stored = getConsent()
  if (stored) applyConsentSignal(stored)
}
