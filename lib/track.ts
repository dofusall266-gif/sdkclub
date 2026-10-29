import { getConsent } from "@/lib/consent"

/** Suivi des parties, côté navigateur. Les événements alimentent la page /admin.
 *  - Sans consentement aux cookies : événements 100 % anonymes (aucun identifiant).
 *  - Avec consentement : un identifiant aléatoire (sans lien avec la personne) permet
 *    de savoir combien de joueurs reviennent. Il reste dans le navigateur du joueur. */

const VISITOR_KEY = "sc_vid_v1"
const SOURCE_KEY = "sc_src_v1"

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `v_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function visitorId(): string | null {
  if (typeof window === "undefined" || getConsent() !== "accepted") return null
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = randomId()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return null
  }
}

function cleanLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9_.-]/g, "").slice(0, 30)
}

const HOST_LABELS: [RegExp, string][] = [
  [/google\./, "google"],
  [/bing\.|duckduckgo|ecosia|qwant|yahoo/, "recherche"],
  [/facebook\.|fb\.com|fb\.me|messenger/, "facebook"],
  [/youtube\.|youtu\.be/, "youtube"],
  [/(^|\.)x\.com$|twitter\.|t\.co$/, "x"],
  [/instagram\./, "instagram"],
  [/tiktok\./, "tiktok"],
  [/reddit\./, "reddit"],
  [/whatsapp\./, "whatsapp"],
]

/** Provenance de la visite, déterminée une seule fois par session, à l'arrivée sur le site :
 * paramètre utm_source du lien s'il existe, sinon site d'origine (referrer), sinon « direct ». */
export function captureSource(): void {
  if (typeof window === "undefined") return
  try {
    if (sessionStorage.getItem(SOURCE_KEY)) return
    const utm = new URLSearchParams(window.location.search).get("utm_source")
    let source = utm ? cleanLabel(utm) : ""
    if (!source && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^www\./, "")
      if (host && host !== window.location.hostname.replace(/^www\./, "")) {
        source = HOST_LABELS.find(([re]) => re.test(host))?.[1] ?? cleanLabel(host)
      }
    }
    sessionStorage.setItem(SOURCE_KEY, source || "direct")
  } catch {
    // Stockage indisponible : la source restera « inconnue ».
  }
}

function currentSource(): string | null {
  try {
    return sessionStorage.getItem(SOURCE_KEY)
  } catch {
    return null
  }
}

function detectDevice(): string {
  if (typeof navigator === "undefined") return "unknown"
  return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ? "mobile" : "desktop"
}

export interface TrackExtra {
  mode: "free" | "daily"
  rating?: number
  duration_seconds?: number
  mistakes?: number
}

export function track(type: "game_started" | "game_won", difficulty: string, extra: TrackExtra) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      difficulty,
      device: detectDevice(),
      source: currentSource(),
      visitor_id: visitorId(),
      ...extra,
    }),
  }).catch(() => {})
}
