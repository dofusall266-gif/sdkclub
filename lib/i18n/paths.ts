import type { Locale } from "@/lib/i18n/dictionaries"

export const SITE_URL = "https://sudoku-club.com"

/**
 * Correspondance des pages françaises et anglaises. Le français est à la racine (/regles),
 * l'anglais sous /en avec des adresses en anglais (/en/rules) : c'est mieux pour Google.
 * Les pages dynamiques (/techniques/x-wing, /blog/mon-article) gardent le même identifiant.
 */
const STATIC_ROUTES: { fr: string; en: string }[] = [
  { fr: "/", en: "/en" },
  { fr: "/defi", en: "/en/daily-challenge" },
  { fr: "/regles", en: "/en/rules" },
  { fr: "/techniques", en: "/en/techniques" },
  { fr: "/blog", en: "/en/blog" },
  { fr: "/qui-sommes-nous", en: "/en/about" },
  { fr: "/contact", en: "/en/contact" },
  { fr: "/mentions-legales", en: "/en/legal-notice" },
  { fr: "/politique-de-confidentialite", en: "/en/privacy-policy" },
  // Pages par niveau de difficulté
  { fr: "/sudoku-facile", en: "/en/easy-sudoku" },
  { fr: "/sudoku-moyen", en: "/en/medium-sudoku" },
  { fr: "/sudoku-difficile", en: "/en/hard-sudoku" },
  { fr: "/sudoku-expert", en: "/en/expert-sudoku" },
  { fr: "/sudoku-diabolique", en: "/en/diabolical-sudoku" },
  { fr: "/sudoku-fou", en: "/en/crazy-sudoku" },
  // Guides des techniques de base (/techniques/<identifiant>) : l'identifiant change avec la langue
  { fr: "/techniques/candidat-unique", en: "/en/techniques/naked-single" },
  { fr: "/techniques/paires-nues", en: "/en/techniques/naked-pairs" },
  { fr: "/techniques/pointage", en: "/en/techniques/pointing-pairs" },
  { fr: "/techniques/paires-cachees", en: "/en/techniques/hidden-pairs" },
]
const DYNAMIC_PREFIXES = ["/techniques/", "/blog/"]

/** Langue d'un chemin (/en… = anglais, le reste = français). */
export function localeOfPath(pathname: string): Locale {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "fr"
}

function splitSuffix(path: string): [string, string] {
  const i = path.search(/[?#]/)
  return i === -1 ? [path, ""] : [path.slice(0, i), path.slice(i)]
}

/** Convertit un chemin interne (avec ?query et #ancre éventuels) vers l'autre langue. Idempotent. */
export function localizePath(path: string, to: Locale): string {
  if (!path.startsWith("/")) return path
  const [pathname, suffix] = splitSuffix(path)
  const from = localeOfPath(pathname)
  if (from === to) return path
  const clean = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname
  const exact = STATIC_ROUTES.find((r) => r[from] === clean)
  if (exact) return exact[to] + suffix
  if (from === "fr") {
    if (DYNAMIC_PREFIXES.some((p) => clean.startsWith(p))) return `/en${clean}${suffix}`
    return path // /admin, /api… : pas de version anglaise
  }
  const frClean = clean.replace(/^\/en/, "")
  if (DYNAMIC_PREFIXES.some((p) => frClean.startsWith(p))) return frClean + suffix
  return "/" + suffix
}

/** Dans un HTML d'article, les liens internes « /techniques/x-wing » deviennent « /en/techniques/x-wing » en anglais. */
export function localizeHtmlLinks(html: string, locale: Locale): string {
  if (locale === "fr") return html
  return html.replace(/href="(\/[^"]*)"/g, (_m, p: string) => `href="${localizePath(p, "en")}"`)
}

/** Balises <link rel="alternate" hreflang> + canonical, à partir du chemin FRANÇAIS de la page. */
export function pageAlternates(frPath: string, locale: Locale, options: { hasEnglish?: boolean } = {}) {
  const hasEnglish = options.hasEnglish ?? true
  const en = localizePath(frPath, "en")
  const self = locale === "fr" ? frPath : en
  if (!hasEnglish) return { canonical: frPath }
  return { canonical: self, languages: { fr: frPath, en, "x-default": frPath } }
}
