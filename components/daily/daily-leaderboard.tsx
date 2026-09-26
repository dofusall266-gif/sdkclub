"use client"

import { Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

import { countryFlag } from "@/lib/countries"
import { PENALTY_SECONDS_PER_MISTAKE } from "@/lib/daily"
import { useLanguage } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface ScoreRow {
  pseudo: string
  country_code: string | null
  seconds: number
  mistakes: number
}

interface MeRow {
  pseudo: string
  country_code: string | null
  seconds: number
  mistakes: number
  rank: number
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

/** Colonne de temps : le temps réel en gras, et — seulement s'il y a des
 * erreurs — le temps "classé" (avec pénalité) juste en dessous, en petit.
 * C'est ce qui rend la pénalité visible plutôt que purement théorique. */
function TimeCell({ seconds, mistakes, penalty }: { seconds: number; mistakes: number; penalty: number }) {
  const { t } = useLanguage()
  return (
    <div className="flex shrink-0 flex-col items-end">
      <span className="font-semibold tabular-nums">{formatTime(seconds)}</span>
      {mistakes > 0 && (
        <span className="text-[0.65rem] tabular-nums text-muted-foreground">
          {t.daily.rankedTime(formatTime(seconds + mistakes * penalty))}
        </span>
      )}
    </div>
  )
}

export function DailyLeaderboard({
  playerPseudo,
  playerId,
  refreshKey,
}: {
  playerPseudo: string | null
  playerId: string | null
  refreshKey: number
}) {
  const { t } = useLanguage()
  const [scores, setScores] = useState<ScoreRow[] | null>(null)
  const [me, setMe] = useState<MeRow | null>(null)
  const [noDb, setNoDb] = useState(false)
  const [penalty, setPenalty] = useState(PENALTY_SECONDS_PER_MISTAKE)

  useEffect(() => {
    let cancelled = false
    const qs = playerId ? `?playerId=${encodeURIComponent(playerId)}` : ""
    fetch(`/api/daily/leaderboard${qs}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.reason === "no-database") setNoDb(true)
        setScores(Array.isArray(data.scores) ? data.scores : [])
        setMe(data.me ?? null)
        if (typeof data.penalty === "number") setPenalty(data.penalty)
      })
      .catch(() => {
        if (!cancelled) setScores([])
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey, playerId])

  const topCount = scores?.length ?? 0
  const showMeSeparately = me !== null && me.rank > topCount

  return (
    <div>
      <h2 className="text-lg font-bold">{t.daily.leaderboardTitle}</h2>
      {!noDb && <p className="mt-0.5 text-xs text-muted-foreground">{t.daily.rankingRule(penalty)}</p>}

      {noDb && <p className="mt-3 text-sm text-muted-foreground">{t.daily.noDbNotice}</p>}

      {!noDb && scores === null && (
        <div className="mt-4 space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      )}

      {!noDb && scores !== null && scores.length === 0 && (
        <p className="mt-3 text-sm text-muted-foreground">{t.daily.leaderboardEmpty}</p>
      )}

      {!noDb && scores !== null && scores.length > 0 && (
        <>
          <ol className="mt-4 divide-y divide-border overflow-hidden rounded-xl border border-border">
            {scores.map((row, i) => {
              const isYou = playerPseudo !== null && row.pseudo === playerPseudo && !showMeSeparately
              return (
                <li
                  key={`${row.pseudo}-${i}`}
                  className={cn("flex items-center justify-between gap-3 px-4 py-2.5 text-sm", isYou && "bg-primary/10")}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 shrink-0 text-right font-semibold tabular-nums text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-lg leading-none">
                      {row.country_code ? countryFlag(row.country_code) : "🏳️"}
                    </span>
                    <span className="truncate font-medium">
                      {row.pseudo} {isYou && <span className="text-xs text-primary">({t.daily.you})</span>}
                    </span>
                    {row.mistakes === 0 ? (
                      <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                        <Sparkles className="size-2.5" /> {t.daily.noMistakesBadge}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-muted-foreground">{t.daily.mistakesCount(row.mistakes)}</span>
                    )}
                  </div>
                  <TimeCell seconds={row.seconds} mistakes={row.mistakes} penalty={penalty} />
                </li>
              )
            })}
          </ol>

          {/* Le joueur n'est pas dans le top affiché : on montre quand même son
              rang exact, pour qu'il puisse se situer et revenir faire mieux. */}
          {showMeSeparately && me && (
            <div className="mt-2 overflow-hidden rounded-xl border border-primary/30 bg-primary/5">
              <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 text-right font-semibold tabular-nums text-primary">{me.rank}</span>
                  <span className="text-lg leading-none">
                    {me.country_code ? countryFlag(me.country_code) : "🏳️"}
                  </span>
                  <span className="truncate font-medium">
                    {me.pseudo} <span className="text-xs text-primary">({t.daily.you})</span>
                  </span>
                  {me.mistakes === 0 ? (
                    <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">
                      <Sparkles className="size-2.5" /> {t.daily.noMistakesBadge}
                    </span>
                  ) : (
                    <span className="shrink-0 text-xs text-muted-foreground">{t.daily.mistakesCount(me.mistakes)}</span>
                  )}
                </div>
                <TimeCell seconds={me.seconds} mistakes={me.mistakes} penalty={penalty} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
