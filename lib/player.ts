import { COUNTRIES } from "@/lib/countries"
import { isValidCountryCode, sanitizePseudo } from "@/lib/moderation"
import { readJSON, remove, writeJSON } from "@/lib/storage"

const PLAYER_KEY = "sc_player_v1"
const OPTOUT_KEY = "sc_lb_optout_v1"

export interface PlayerProfile {
  id: string
  pseudo: string
  countryCode: string // code ISO 3166-1 alpha-2, ex "FR"
  /** Vrai tant que le joueur n'a pas choisi lui-même son pseudo (pseudo généré automatiquement). */
  auto?: boolean
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/** Charge le profil local (pseudo + drapeau), s'il existe. */
export function getPlayerProfile(): PlayerProfile | null {
  return readJSON<PlayerProfile>(PLAYER_KEY)
}

/** Enregistre / met à jour le profil choisi par le joueur. Un id stable est généré une seule fois.
 *  Enregistrer un profil lève aussi un éventuel retrait du classement. */
export function savePlayerProfile(pseudo: string, countryCode: string): PlayerProfile {
  const existing = getPlayerProfile()
  const profile: PlayerProfile = { id: existing?.id ?? randomId(), pseudo, countryCode, auto: false }
  writeJSON(PLAYER_KEY, profile)
  remove(OPTOUT_KEY)
  return profile
}

/** Le joueur a demandé à ne plus apparaître au classement : plus aucun envoi automatique. */
export function isLeaderboardOptOut(): boolean {
  return readJSON<boolean>(OPTOUT_KEY) === true
}

export function setLeaderboardOptOut(value: boolean): void {
  if (value) writeJSON(OPTOUT_KEY, true)
  else remove(OPTOUT_KEY)
}

/** Oublie le profil local (après un retrait du classement). Les points locaux sont conservés. */
export function clearPlayerProfile(): void {
  remove(PLAYER_KEY)
}

const NAMES = {
  fr: {
    animals: ["Renard", "Hibou", "Panda", "Lynx", "Loup", "Koala", "Faucon", "Tigre", "Lama", "Otarie", "Lapin", "Cerf"],
    adjectives: ["rapide", "calme", "agile", "brave", "sage", "habile", "fidèle", "zen", "magique", "solide", "stoïque"],
    pattern: (a: string, adj: string, n: number) => `${a} ${adj} ${n}`,
  },
  en: {
    animals: ["Fox", "Owl", "Panda", "Lynx", "Wolf", "Koala", "Falcon", "Tiger", "Llama", "Otter", "Rabbit", "Deer"],
    adjectives: ["Swift", "Calm", "Brave", "Lucky", "Sharp", "Clever", "Quick", "Bold", "Happy", "Wise", "Zen"],
    pattern: (a: string, adj: string, n: number) => `${adj} ${a} ${n}`,
  },
} as const

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)]
}

/** Pseudo amusant et lisible (ex. « Renard rapide 42 », « Swift Fox 42 »), 20 caractères maximum, accepté par le filtre. */
export function generatePseudo(locale: "fr" | "en"): string {
  const set = NAMES[locale]
  for (let i = 0; i < 30; i++) {
    const candidate = set.pattern(pick(set.animals), pick(set.adjectives), 10 + Math.floor(Math.random() * 90))
    if (candidate.length <= 20 && sanitizePseudo(candidate)) return candidate
  }
  return `${locale === "fr" ? "Joueur" : "Player"} ${1000 + Math.floor(Math.random() * 9000)}`
}

/** Pays supposé d'après la langue du navigateur (ex. « fr-MA » → MA), sinon un défaut selon la langue du site. Modifiable par le joueur. */
export function guessCountry(locale: "fr" | "en"): string {
  if (typeof navigator !== "undefined") {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language]
    for (const l of langs) {
      const region = l?.split("-")[1]?.toUpperCase()
      if (region && isValidCountryCode(region) && COUNTRIES.some((c) => c.code === region)) return region
    }
  }
  return locale === "fr" ? "FR" : "US"
}

/** Renvoie le profil existant, ou en crée un automatiquement (pseudo généré + pays supposé). Renvoie `null` si le joueur s'est retiré du classement. */
export function ensurePlayerProfile(locale: "fr" | "en"): PlayerProfile | null {
  const existing = getPlayerProfile()
  if (existing) return existing
  if (isLeaderboardOptOut()) return null
  const profile: PlayerProfile = {
    id: randomId(),
    pseudo: generatePseudo(locale),
    countryCode: guessCountry(locale),
    auto: true,
  }
  writeJSON(PLAYER_KEY, profile)
  return profile
}
