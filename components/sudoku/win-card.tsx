"use client"

import { Flame, Sparkles, Trophy, X } from "lucide-react"
import Link from "@/components/localized-link"
import { type ReactNode, useEffect, useState } from "react"

import { ShareResult } from "@/components/share-result"
import { Button, buttonVariants } from "@/components/ui/button"
import { countryFlag, sortedCountries } from "@/lib/countries"
import { useLanguage } from "@/lib/i18n/context"
import { getPlayerProfile, savePlayerProfile, type PlayerProfile } from "@/lib/player"
import { getLastRank, setLastRank } from "@/lib/points-store"
import { submitPoints } from "@/lib/points-client"
import { PERIODS, type Period, type ScoreBreakdown } from "@/lib/scoring"

const TEXT = {
  fr: {
    level: "Niveau",
    time: "Temps",
    earned: "points gagnés",
    resolution: "Bonne résolution",
    combo: "Combo",
    timeBonus: "Bonus de temps",
    flawless: "Partie sans faute",
    daily: "Bonus défi du jour",
    scoreRecord: "Meilleur score battu !",
    playFree: "Jouer une grille libre",
    close: "Fermer",
    detail: "Détail des points",
    periods: { day: "Aujourd’hui", week: "Cette semaine", month: "Ce mois", all: "Total" } as Record<Period, string>,
    rank: "Classement général",
    rankSending: "Calcul de ta place…",
    rankError: "Classement indisponible pour le moment.",
    noDb: "Le classement n’est pas activé sur ce site.",
    joinTitle: "Apparaître au classement",
    joinText: "Un pseudo suffit, sans compte. Tes points de cette partie seront comptés.",
    pseudo: "Pseudo",
    country: "Pays",
    join: "Rejoindre le classement",
    sending: "Envoi…",
    pseudoError: "Pseudo invalide (1 à 20 caractères, sans mot interdit).",
    next: "Grille suivante",
    board: "Classement",
    rules: "Comment sont calculés les points ?",
  },
  en: {
    level: "Level",
    time: "Time",
    earned: "points earned",
    resolution: "Correct answers",
    combo: "Combo",
    timeBonus: "Time bonus",
    flawless: "Flawless game",
    daily: "Daily challenge bonus",
    scoreRecord: "New best score!",
    playFree: "Play a free puzzle",
    close: "Close",
    detail: "Points breakdown",
    periods: { day: "Today", week: "This week", month: "This month", all: "Total" } as Record<Period, string>,
    rank: "Overall ranking",
    rankSending: "Finding your place…",
    rankError: "Leaderboard unavailable right now.",
    noDb: "The leaderboard is not enabled on this site.",
    joinTitle: "Join the leaderboard",
    joinText: "A nickname is enough, no account needed. This game’s points will count.",
    pseudo: "Nickname",
    country: "Country",
    join: "Join the leaderboard",
    sending: "Sending…",
    pseudoError: "Invalid nickname (1 to 20 characters, no banned word).",
    next: "Next puzzle",
    board: "Leaderboard",
    rules: "How are points calculated?",
  },
} as const

interface Props {
  difficultyLabel: string
  difficulty: string
  gameId: string
  seconds: number
  mistakes: number
  breakdown: ScoreBreakdown
  /** Totaux locaux (déjà incluant cette partie). */
  localTotals: Record<Period, number>
  isRecord: boolean
  /** Meilleur score (une seule partie) battu. */
  isScoreRecord?: boolean
  /** Défi du jour : pas de « grille suivante », le pseudo est demandé par le formulaire du défi (`extra`). */
  mode?: "free" | "daily"
  /** Contenu supplémentaire sous le récapitulatif (défi du jour : classement du temps). */
  extra?: ReactNode
  /** Change quand un pseudo vient d'être enregistré ailleurs (formulaire du défi du jour) : déclenche l'envoi des points. */
  profileKey?: number
  streak: number
  shareText: string
  showDailyCta: boolean
  onNewGame: () => void
  /** Ferme le récapitulatif (croix, touche Échap ou clic à côté). */
  onClose: () => void
}

function fmtTime(total: number): string {
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

export function WinCard(props: Props) {
  const { locale, t } = useLanguage()
  const x = TEXT[locale]
  const { breakdown } = props
  const fmt = (n: number) => n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")

  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [state, setState] = useState<"idle" | "sending" | "ok" | "error" | "no-db">("idle")
  const [rank, setRank] = useState<{ value: number; up: number } | null>(null)
  const [totals, setTotals] = useState(props.localTotals)
  const [counter, setCounter] = useState(0)
  const [badPseudo, setBadPseudo] = useState(false)

  // Compteur de points qui monte (2 s).
  useEffect(() => {
    const start = performance.now() + 450
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, Math.max(0, (now - start) / 2000))
      setCounter(Math.round(breakdown.total * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [breakdown.total])

  const send = async (p: PlayerProfile) => {
    setState("sending")
    const res = await submitPoints({
      profile: p,
      gameId: props.gameId,
      difficulty: props.difficulty,
      points: breakdown.total,
      seconds: props.seconds,
      mistakes: props.mistakes,
      daily: props.mode === "daily",
    })
    if (res.ok && res.rank && res.totals) {
      const previous = getLastRank()
      setRank({ value: res.rank, up: previous !== null ? Math.max(0, previous - res.rank) : 0 })
      setLastRank(res.rank)
      setTotals(res.totals)
      setState("ok")
    } else if (res.reason === "no-database") setState("no-db")
    else if (res.reason === "invalid-pseudo") {
      // Pseudo refusé par le filtre : on redemande un autre pseudo.
      setBadPseudo(true)
      setProfile(null)
      setState("idle")
    } else setState("error")
  }

  // Si le joueur a déjà un pseudo (défi du jour ou partie précédente), envoi automatique.
  useEffect(() => {
    const existing = getPlayerProfile()
    setProfile(existing)
    if (existing && breakdown.total >= 1) void send(existing)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Défi du jour : le pseudo vient d'être enregistré par le formulaire du défi -> on envoie aussi les points.
  useEffect(() => {
    if (!props.profileKey) return
    const existing = getPlayerProfile()
    if (existing && state === "idle" && breakdown.total >= 1) {
      setProfile(existing)
      void send(existing)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.profileKey])

  const reveal = (n: number) => ({ animationDelay: `${500 + n * 170}ms` })

  // Échap ferme le récapitulatif.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") props.onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [props])

  const daily = props.mode === "daily"
  const breakdownRows = (
    <div className="text-sm">
      {[
        [x.resolution, breakdown.resolution],
        [x.combo, breakdown.combo],
        [x.timeBonus, breakdown.time],
        [x.flawless, breakdown.flawless],
        ...(breakdown.daily > 0 ? [[x.daily, breakdown.daily]] : []),
      ].map(([label, value]) => (
        <div key={label as string} className="flex justify-between border-b border-border py-1.5">
          <span>{label}</span>
          <b className="tabular-nums">+{fmt(value as number)}</b>
        </div>
      ))}
    </div>
  )
  const periodRows = (
    <div className="text-sm">
      {PERIODS.map((p) => (
        <div key={p} className="flex items-center justify-between border-b border-border py-1.5">
          <span>{x.periods[p]}</span>
          <span className="flex items-center gap-2">
            <span className="rounded-full bg-flash/15 px-2 py-0.5 text-xs font-bold text-flash">+{fmt(breakdown.total)}</span>
            <b className="tabular-nums">{fmt(totals[p])}</b>
          </span>
        </div>
      ))}
      <div className="flex items-center justify-between py-2 font-semibold">
        <span>{x.rank}</span>
        <span className="tabular-nums">
          {state === "ok" && rank ? (
            <>
              #{rank.value}
              {rank.up > 0 && <span className="ml-1.5 text-flash">▲{rank.up}</span>}
            </>
          ) : state === "sending" ? (
            <span className="text-xs font-normal text-muted-foreground">{x.rankSending}</span>
          ) : state === "error" ? (
            <span className="text-xs font-normal text-muted-foreground">{x.rankError}</span>
          ) : state === "no-db" ? (
            <span className="text-xs font-normal text-muted-foreground">{x.noDb}</span>
          ) : null}
        </span>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={props.onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="animate-card-pop relative max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={props.onClose}
          aria-label={x.close}
          title={x.close}
          className="absolute top-3 right-3 z-10 grid size-9 place-items-center rounded-full bg-secondary text-foreground/80 transition-colors hover:bg-secondary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>
        <div className="animate-row-reveal grid grid-cols-2 gap-3 text-center" style={reveal(0)}>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{x.level}</p>
            <p className="text-3xl font-bold">{props.difficultyLabel}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{x.time}</p>
            <p className="text-3xl font-bold tabular-nums">{fmtTime(props.seconds)}</p>
          </div>
        </div>

        <div className="animate-row-reveal mt-4 text-center" style={reveal(1)}>
          <p className="text-6xl leading-none font-extrabold text-primary tabular-nums">{fmt(counter)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{x.earned}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {props.isRecord && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" /> {t.game.newRecord}
              </span>
            )}
            {props.isScoreRecord && (
              <span className="inline-flex items-center gap-1 rounded-full bg-flash/15 px-3 py-1 text-xs font-semibold text-flash">
                <Trophy className="size-3.5" /> {x.scoreRecord}
              </span>
            )}
            {props.streak > 1 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-600 dark:text-orange-400">
                <Flame className="size-3.5" /> {t.game.streakLine(props.streak)}
              </span>
            )}
          </div>
        </div>

        {daily ? (
          <>
            {/* Défi du jour : ce qu'on veut voir en premier, c'est sa place par rapport aux autres. */}
            {props.extra && (
              <div className="animate-row-reveal mt-4" style={reveal(2)}>
                {props.extra}
              </div>
            )}
            <details className="animate-row-reveal mt-4 rounded-xl border border-border" style={reveal(3)}>
              <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">{x.detail}</summary>
              <div className="px-3 pb-2">
                {breakdownRows}
                {periodRows}
              </div>
            </details>
          </>
        ) : (
          <>
            <div className="animate-row-reveal mt-4" style={reveal(2)}>
              {breakdownRows}
            </div>
            <div className="animate-row-reveal mt-4" style={reveal(3)}>
              {periodRows}
            </div>
          </>
        )}

        {props.mode !== "daily" && !profile && state === "idle" && (
          <div className="animate-row-reveal" style={reveal(4)}>
            <JoinForm
              initialError={badPseudo}
              onJoin={(p) => {
                setProfile(p)
                void send(p)
              }}
            />
          </div>
        )}

        {!daily && props.extra && (
          <div className="animate-row-reveal mt-4" style={reveal(4)}>
            {props.extra}
          </div>
        )}

        <div className="animate-row-reveal mt-4 flex gap-2" style={reveal(5)}>
          {props.mode === "daily" ? (
            <Link href="/" className={buttonVariants({ size: "lg" }) + " flex-1"}>
              <Sparkles className="size-4" /> {x.playFree}
            </Link>
          ) : (
            <Button className="flex-1" size="lg" onClick={props.onNewGame}>
              <Sparkles className="size-4" /> {x.next}
            </Button>
          )}
          <Link href="/classement" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {x.board}
          </Link>
        </div>
        <div className="animate-row-reveal mt-3 flex flex-col items-center gap-2" style={reveal(6)}>
          <ShareResult text={props.shareText} />
          <Link href="/regles-des-points" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
            {x.rules}
          </Link>
          {props.showDailyCta && (
            <Link href="/defi" className="flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:underline dark:text-orange-400">
              <Flame className="size-3.5" /> {t.game.dailyCta}
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

function JoinForm({ onJoin, initialError }: { onJoin: (p: PlayerProfile) => void; initialError?: boolean }) {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const [pseudo, setPseudo] = useState("")
  const [country, setCountry] = useState("FR")
  const [error, setError] = useState(initialError ?? false)
  const countries = sortedCountries(locale)

  return (
    <form
      className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3"
      onSubmit={(e) => {
        e.preventDefault()
        const trimmed = pseudo.trim()
        if (trimmed.length < 1 || trimmed.length > 20) return setError(true)
        onJoin(savePlayerProfile(trimmed, country))
      }}
    >
      <p className="text-sm font-semibold">{x.joinTitle}</p>
      <p className="text-xs text-muted-foreground">{x.joinText}</p>
      <div className="flex gap-2">
        <input
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          maxLength={20}
          placeholder={x.pseudo}
          aria-label={x.pseudo}
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          aria-label={x.country}
          className="w-24 rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {countryFlag(c.code)} {c.code}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-xs text-destructive">{x.pseudoError}</p>}
      <Button type="submit" size="sm">
        {x.join}
      </Button>
    </form>
  )
}
