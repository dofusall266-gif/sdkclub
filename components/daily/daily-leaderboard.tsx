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

/** Colonne de temps : le temps CORRIGÉ (celui qui sert réellement au
 * classement, pénalité incluse) affiché en gras — c'est la valeur qui compte
 * pour la compétition. Le temps réel, sans pénalité, reste visible juste en
 * dessous en plus petit, seulement si les deux diffèrent. */
function TimeCell({ seconds, mistakes, penalty }: { seconds: number; mistakes: number; penalty: number }) {
  const { t } = useLanguage()
  const effective = seconds + mistakes * penalty
  return (
    <div className="flex shrink-0 flex-col items-end">
      <span className="font-semibold tabular-nums">{formatTime(effective)}</span>
      {mistakes > 0 && (
        <span className="text-[0.65rem] tabular-nums text-muted-foreground">{t.daily.realTime(formatTime(seconds))}</span>
      )}
    </div>
  )
}

/** Pastille "sans faute" / "N erreurs". Sous le pseudo (et non à côté), pour
 * que le pseudo garde toute la largeur disponible sur petit écran. */
function MistakesBadge({ mistakes }: { mistakes: number }) {
  const { t } = useLanguage()
  if (mistakes === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">
        <Sparkles className="size-2.5" /> {t.daily.noMistakesBadge}
      </span>
    )
  }
  return <span className="text-xs font-medium text-destructive">{t.daily.mistakesCount(mistakes)}</span>
}

/** Une ligne du classement. Deux lignes de texte dans le bloc identité :
 * pseudo (tronqué seulement s'il dépasse vraiment la largeur) puis erreurs. */
function ScoreLine({
  rank,
  row,
  penalty,
  isYou,
  highlightRank,
}: {
  rank: number
  row: { pseudo: string; country_code: string | null; seconds: number; mistakes: number }
  penalty: number
  isYou: boolean
  highlightRank?: boolean
}) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className={cn(
            "w-6 shrink-0 text-right font-semibold tabular-nums",
            highlightRank ? "text-primary" : "text-muted-foreground",
          )}
        >
          {rank}
        </span>
        <span className="text-lg leading-none">{row.country_code ? countryFlag(row.country_code) : "🏳️"}</span>
        <div className="flex min-w-0 flex-col items-start gap-0.5">
          <span className="max-w-full truncate font-medium">
            {row.pseudo} {isYou && <span className="text-xs text-primary">({t.daily.you})</span>}
          </span>
          <MistakesBadge mistakes={row.mistakes} />
        </div>
      </div>
      <TimeCell seconds={row.seconds} mistakes={row.mistakes} penalty={penalty} />
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
                <li key={`${row.pseudo}-${i}`} className={cn(isYou && "bg-primary/10")}>
                  <ScoreLine rank={i + 1} row={row} penalty={penalty} isYou={isYou} />
                </li>
              )
            })}
          </ol>

          {/* Le joueur n'est pas dans le top affiché : on montre quand même son
              rang exact, pour qu'il puisse se situer et revenir faire mieux. */}
          {showMeSeparately && me && (
            <div className="mt-2 overflow-hidden rounded-xl border border-primary/30 bg-primary/5">
              <ScoreLine rank={me.rank} row={me} penalty={penalty} isYou highlightRank />
            </div>
          )}
        </>
      )}
    </div>
  )
}
