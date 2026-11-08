import type { PlayerProfile } from "@/lib/player"
import type { Period } from "@/lib/scoring"

export interface SubmitResult {
  ok: boolean
  reason?: string
  totals?: Record<Period, number>
  rank?: number
}

/** Envoie le score d'une partie au classement général (avec un délai max : la base peut mettre un instant à se réveiller). */
export async function submitPoints(args: {
  profile: PlayerProfile
  gameId: string
  difficulty: string
  points: number
  seconds: number
  mistakes: number
}): Promise<SubmitResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const res = await fetch("/api/points/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        playerId: args.profile.id,
        pseudo: args.profile.pseudo,
        countryCode: args.profile.countryCode,
        gameId: args.gameId,
        difficulty: args.difficulty,
        points: args.points,
        seconds: args.seconds,
        mistakes: args.mistakes,
      }),
    })
    return (await res.json()) as SubmitResult
  } catch {
    return { ok: false, reason: "network" }
  } finally {
    clearTimeout(timeout)
  }
}
