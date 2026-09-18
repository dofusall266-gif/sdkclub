export const CONSENT_KEY = "sudokuclub-cookie-consent"
export const CONSENT_EVENT = "sc-consent-change"

export type ConsentValue = "accepted" | "refused"

export function getConsent(): ConsentValue | null {
  try {
    return localStorage.getItem(CONSENT_KEY) as ConsentValue | null
  } catch {
    return null
  }
}

export function setConsent(value: ConsentValue) {
  try {
    localStorage.setItem(CONSENT_KEY, value)
  } catch {
    // localStorage indisponible : on continue quand même, juste sans mémorisation.
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
  }
}
