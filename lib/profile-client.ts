import type { PlayerProfile } from "@/lib/player"

interface ProfileResult {
  ok: boolean
  reason?: string
}

async function post(body: Record<string, unknown>): Promise<ProfileResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch("/api/points/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify(body),
    })
    return (await res.json()) as ProfileResult
  } catch {
    return { ok: false, reason: "network" }
  } finally {
    clearTimeout(timeout)
  }
}

/** Répercute un changement de pseudo / pays sur tous les scores déjà enregistrés de ce joueur. */
export function syncProfile(profile: PlayerProfile): Promise<ProfileResult> {
  return post({ action: "update", playerId: profile.id, pseudo: profile.pseudo, countryCode: profile.countryCode })
}
