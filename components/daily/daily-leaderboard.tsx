"use client"

import { useEffect, useState } from "react"

import { countryFlag } from "@/lib/countries"
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
  rank: number
}

function formatTime(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
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
      })
      .catch(() => {
        if (!cancelled) setScores([])
      })
    return () => {
      cancelled = true
    }
  }, [refreshKey, playerId])

  const topCount = scores?.length ?? 0
  // On n'affiche la ligne "vous" séparément que si le joueur n'apparaît pas déjà dans le top affiché.
  const showMeSeparately = me !== null && me.rank > topCount

  return (
    <div>
      <h2 className="text-lg font-bold">{t.daily.leaderboardTitle}</h2>

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
                  </div>
                  <span className="shrink-0 font-semibold tabular-nums">{formatTime(row.seconds)}</span>
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
                </div>
                <span className="shrink-0 font-semibold tabular-nums">{formatTime(me.seconds)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
