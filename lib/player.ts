import { readJSON, writeJSON } from "@/lib/storage"

const PLAYER_KEY = "sc_player_v1"

export interface PlayerProfile {
  id: string
  pseudo: string
  countryCode: string // code ISO 3166-1 alpha-2, ex "FR"
}

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID()
  return `p_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

/** Charge le profil local (pseudo + drapeau choisis par le joueur), s'il existe. */
export function getPlayerProfile(): PlayerProfile | null {
  return readJSON<PlayerProfile>(PLAYER_KEY)
}

/** Enregistre / met à jour le profil local. Un id stable est généré une seule fois. */
export function savePlayerProfile(pseudo: string, countryCode: string): PlayerProfile {
  const existing = getPlayerProfile()
  const profile: PlayerProfile = { id: existing?.id ?? randomId(), pseudo, countryCode }
  writeJSON(PLAYER_KEY, profile)
  return profile
}
