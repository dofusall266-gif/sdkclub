"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { sortedCountries, countryFlag } from "@/lib/countries"
import { useLanguage } from "@/lib/i18n/context"
import { getPlayerProfile, savePlayerProfile } from "@/lib/player"
import { cn } from "@/lib/utils"

interface Props {
  seconds: number
  mistakes: number
  dateKey: string
  onSubmitted: (pseudo: string) => void
  /** "card" (par défaut) : bloc avec bordure, pour un affichage autonome.
   *  "inline" : sans bordure/fond, pour être posé sur l'overlay de victoire. */
  variant?: "card" | "inline"
}

export function DailySubmitForm({ seconds, mistakes, dateKey, onSubmitted, variant = "card" }: Props) {
  const { t, locale } = useLanguage()
  const existing = getPlayerProfile()
  const [pseudo, setPseudo] = useState(existing?.pseudo ?? "")
  const [countryCode, setCountryCode] = useState(existing?.countryCode ?? "FR")
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error" | "invalid" | "no-db" | "timeout">("idle")
  const countries = sortedCountries(locale)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = pseudo.trim()
    if (trimmed.length < 1 || trimmed.length > 20) {
      setStatus("invalid")
      return
    }
    setStatus("sending")
    const profile = savePlayerProfile(trimmed, countryCode)

    // Filet de sécurité : si le serveur (ou la base Neon, qui peut mettre un
    // instant à "se réveiller" sur le plan gratuit) met trop de temps à
    // répondre, on arrête d'attendre plutôt que de laisser le bouton bloqué
    // indéfiniment sur "Envoi...".
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const res = await fetch("/api/daily/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          date: dateKey,
          playerId: profile.id,
          pseudo: trimmed,
          countryCode,
          seconds,
          mistakes,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        setStatus("done")
        onSubmitted(trimmed)
      } else if (data.reason === "invalid-pseudo") {
        setStatus("invalid")
      } else if (data.reason === "no-database") {
        setStatus("no-db")
      } else {
        setStatus("error")
      }
    } catch (err) {
      setStatus(err instanceof DOMException && err.name === "AbortError" ? "timeout" : "error")
    } finally {
      clearTimeout(timeoutId)
    }
  }

  if (status === "done") {
    return <p className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-primary">{t.daily.submitted}</p>
  }

  if (status === "no-db") {
    return <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">{t.daily.noDbNotice}</p>
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-3",
        variant === "card" && "rounded-xl border border-border bg-card p-4",
      )}
    >
      {variant === "card" && <h3 className="font-semibold">{t.daily.submitHeading}</h3>}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="daily-pseudo" className="text-sm font-medium text-muted-foreground">
          {t.daily.pseudoLabel}
        </label>
        <input
          id="daily-pseudo"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          maxLength={20}
          placeholder={t.daily.pseudoPlaceholder}
          required
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="daily-country" className="text-sm font-medium text-muted-foreground">
          {t.daily.countryLabel}
        </label>
        <select
          id="daily-country"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {countryFlag(c.code)} {locale === "fr" ? c.fr : c.en}
            </option>
          ))}
        </select>
      </div>

      {status === "invalid" && <p className="text-sm text-destructive">{t.daily.pseudoError}</p>}
      {status === "error" && <p className="text-sm text-destructive">{t.daily.submitError}</p>}
      {status === "timeout" && <p className="text-sm text-destructive">{t.daily.submitTimeout}</p>}

      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? t.daily.submitting : t.daily.submit}
      </Button>
    </form>
  )
}
