"use client"

import { useEffect, useState } from "react"
import Link from "@/components/localized-link"

import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"
import { countryFlag } from "@/lib/countries"
import { useLanguage } from "@/lib/i18n/context"
import { getPlayerProfile } from "@/lib/player"
import { PERIODS, type Period } from "@/lib/scoring"
import { cn } from "@/lib/utils"

interface Row {
  pseudo: string
  country_code: string | null
  total: number
  games: number
  rank?: number
}

const TEXT = {
  fr: {
    h1: "Classement général",
    lead: "Les meilleurs joueurs de Sudoku-Club, tous niveaux confondus. Ouvert à tous : un simple pseudo à la fin d’une partie suffit pour apparaître ici.",
    periods: { day: "Aujourd’hui", week: "Cette semaine", month: "Ce mois", all: "Total" } as Record<Period, string>,
    loading: "Chargement…",
    empty: "Personne pour l’instant sur cette période. Sois le premier !",
    noDb: "Le classement n’est pas activé sur ce site pour le moment.",
    error: "Impossible de charger le classement. Réessaie dans un instant.",
    games: (n: number) => `${n} partie${n > 1 ? "s" : ""}`,
    you: "Toi",
    yourRank: "Ta place",
    play: "Jouer pour monter au classement",
    rules: "Comment sont calculés les points ?",
  },
  en: {
    h1: "Overall leaderboard",
    lead: "The best Sudoku-Club players, all levels combined. Open to everyone: just a nickname at the end of a game to appear here.",
    periods: { day: "Today", week: "This week", month: "This month", all: "Total" } as Record<Period, string>,
    loading: "Loading…",
    empty: "Nobody yet for this period. Be the first!",
    noDb: "The leaderboard is not enabled on this site right now.",
    error: "Could not load the leaderboard. Please try again in a moment.",
    games: (n: number) => `${n} game${n > 1 ? "s" : ""}`,
    you: "You",
    yourRank: "Your place",
    play: "Play to climb the leaderboard",
    rules: "How are points calculated?",
  },
} as const

export function LeaderboardContent() {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const [period, setPeriod] = useState<Period>("day")
  const [state, setState] = useState<"loading" | "ok" | "no-db" | "error">("loading")
  const [rows, setRows] = useState<Row[]>([])
  const [me, setMe] = useState<Row | null>(null)
  const [myPseudo, setMyPseudo] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const profile = getPlayerProfile()
    setMyPseudo(profile?.pseudo ?? null)
    setState("loading")
    const query = new URLSearchParams({ period })
    if (profile) query.set("playerId", profile.id)
    fetch(`/api/points/leaderboard?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.reason === "no-database") return setState("no-db")
        if (!data.ok) return setState("error")
        setRows(data.scores)
        setMe(data.me)
        setState("ok")
      })
      .catch(() => !cancelled && setState("error"))
    return () => {
      cancelled = true
    }
  }, [period])

  const fmt = (n: number) => n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")
  const inTop = me ? rows.some((r) => r.pseudo === me.pseudo && r.total === me.total) : false

  return (
    <PageLayout>
      <div className="mx-auto max-w-[42rem]">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{x.h1}</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">{x.lead}</p>

        <div className="mt-6 flex flex-wrap gap-2" role="tablist">
          {PERIODS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={period === p}
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-xl border px-4 py-2 text-sm font-medium transition-colors",
                period === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-secondary",
              )}
            >
              {x.periods[p]}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
          {state === "loading" && <p className="p-5 text-sm text-muted-foreground">{x.loading}</p>}
          {state === "no-db" && <p className="p-5 text-sm text-muted-foreground">{x.noDb}</p>}
          {state === "error" && <p className="p-5 text-sm text-destructive">{x.error}</p>}
          {state === "ok" && rows.length === 0 && <p className="p-5 text-sm text-muted-foreground">{x.empty}</p>}
          {state === "ok" &&
            rows.map((r, i) => {
              const mine = myPseudo !== null && r.pseudo === myPseudo && me?.total === r.total
              return (
                <div
                  key={`${r.pseudo}-${i}`}
                  className={cn(
                    "flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0",
                    mine && "bg-primary/10 font-semibold",
                  )}
                >
                  <span className="w-7 text-sm tabular-nums text-muted-foreground">{i + 1}</span>
                  <span className="text-lg" aria-hidden="true">
                    {countryFlag(r.country_code ?? "")}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.pseudo}
                    {mine && <span className="ml-2 text-xs text-primary">({x.you})</span>}
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:inline">{x.games(r.games)}</span>
                  <b className="tabular-nums">{fmt(r.total)}</b>
                </div>
              )
            })}
        </div>

        {state === "ok" && me && !inTop && (
          <div className="mt-3 flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2.5 font-semibold">
            <span className="w-7 text-sm tabular-nums">{me.rank}</span>
            <span className="min-w-0 flex-1 truncate">
              {me.pseudo} <span className="text-xs text-primary">({x.yourRank})</span>
            </span>
            <b className="tabular-nums">{fmt(me.total)}</b>
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            {x.play}
          </Link>
          <Link href="/regles-des-points" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
            {x.rules}
          </Link>
        </div>
      </div>
    </PageLayout>
  )
}
