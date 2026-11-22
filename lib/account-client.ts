import type { PlayerProfile } from "@/lib/player"

/** Identifiant client OAuth Google (public par nature). Sans lui, la connexion Google reste masquée. */
export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ""

interface GoogleIdApi {
  initialize(config: { client_id: string; callback: (r: { credential?: string }) => void; auto_select?: boolean }): void
  renderButton(el: HTMLElement, options: Record<string, unknown>): void
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleIdApi } }
  }
}

let scriptPromise: Promise<GoogleIdApi> | null = null

/** Charge le script Google uniquement à la demande (jamais au chargement de la page), par respect du consentement. */
export function loadGoogleIdentity(): Promise<GoogleIdApi> {
  const ready = window.google?.accounts?.id
  if (ready) return Promise.resolve(ready)
  if (!scriptPromise) {
    scriptPromise = new Promise<GoogleIdApi>((resolve, reject) => {
      const s = document.createElement("script")
      s.src = "https://accounts.google.com/gsi/client"
      s.async = true
      s.defer = true
      s.onload = () => {
        const api = window.google?.accounts?.id
        if (api) resolve(api)
        else reject(new Error("google-unavailable"))
      }
      s.onerror = () => reject(new Error("google-blocked"))
      document.head.appendChild(s)
    }).catch((e) => {
      scriptPromise = null
      throw e
    })
  }
  return scriptPromise
}

let googleInitialized = false
let credentialHandler: ((credential: string) => void) | null = null

/** Initialise Google une seule fois, puis dessine le bouton officiel « Continuer avec Google » dans `el`. */
export function setupGoogleButton(
  api: GoogleIdApi,
  el: HTMLElement,
  locale: string,
  onCredential: (credential: string) => void,
): void {
  credentialHandler = onCredential
  if (!googleInitialized) {
    api.initialize({
      client_id: GOOGLE_CLIENT_ID,
      auto_select: false,
      callback: (r) => {
        if (r.credential) credentialHandler?.(r.credential)
      },
    })
    googleInitialized = true
  }
  el.innerHTML = ""
  api.renderButton(el, { type: "standard", theme: "outline", size: "large", text: "continue_with", shape: "pill", width: 280, locale })
}

export interface GoogleLoginResult {
  ok: boolean
  reason?: string
  playerId?: string
  pseudo?: string
  countryCode?: string | null
  created?: boolean
  merged?: boolean
}

/** Envoie le jeton Google au serveur, avec le profil local pour rattacher les points déjà gagnés sur cet appareil. */
export async function googleLogin(credential: string, local: PlayerProfile | null): Promise<GoogleLoginResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 15000)
  try {
    const res = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        credential,
        playerId: local?.id ?? "",
        pseudo: local?.pseudo ?? "",
        countryCode: local?.countryCode ?? "",
      }),
    })
    return (await res.json()) as GoogleLoginResult
  } catch {
    return { ok: false, reason: "network" }
  } finally {
    clearTimeout(timeout)
  }
}
