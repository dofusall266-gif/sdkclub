"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { sortedCountries, countryFlag } from "@/lib/countries"
import { useLanguage } from "@/lib/i18n/context"
import { ensurePlayerProfile, getPlayerProfile, savePlayerProfile, type PlayerProfile } from "@/lib/player"
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
  const [status, setStatus] = useState<
    "idle" | "sending" | "done" | "error" | "invalid" | "no-db" | "timeout" | "invalid-score"
  >("idle")
  const countries = sortedCountries(locale)

  /** Envoie le temps au serveur. Renvoie le statut correspondant ("done" si tout va bien). */
  const sendScore = async (profile: PlayerProfile): Promise<typeof status> => {
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
          pseudo: profile.pseudo,
          countryCode: profile.countryCode,
          seconds,
          mistakes,
        }),
      })
      const data = await res.json()
      if (data.ok) return "done"
      if (data.reason === "invalid-pseudo") return "invalid"
      if (data.reason === "no-database") return "no-db"
      if (data.reason === "invalid-seconds" || data.reason === "invalid-mistakes") return "invalid-score"
      return "error"
    } catch (err) {
      return err instanceof DOMException && err.name === "AbortError" ? "timeout" : "error"
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /** Envoi avec une seconde tentative automatique en cas de problème réseau / base qui se réveille. */
  const sendWithRetry = async (profile: PlayerProfile) => {
    setStatus("sending")
    let result = await sendScore(profile)
    if (result === "error" || result === "timeout") {
      await new Promise((r) => setTimeout(r, 2500))
      result = await sendScore(profile)
    }
    setStatus(result)
    if (result === "done") onSubmitted(profile.pseudo)
  }

  // Envoi automatique à la fin du défi : avec le profil existant, ou un profil créé à la volée
  // (pseudo généré + pays supposé, modifiables ensuite).
  const autoStartedRef = useRef(false)
  useEffect(() => {
    if (autoStartedRef.current) return
    autoStartedRef.current = true
    const profile = ensurePlayerProfile(locale)
    setPseudo(profile.pseudo)
    setCountryCode(profile.countryCode)
    void sendWithRetry(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Formulaire manuel, affiché seulement si l'envoi automatique a échoué : bouton « Valider mon score » pour réessayer.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = pseudo.trim()
    if (trimmed.length < 1 || trimmed.length > 20) {
      setStatus("invalid")
      return
    }
    await sendWithRetry(savePlayerProfile(trimmed, countryCode))
  }

  if (status === "sending") {
    return <p className="rounded-xl bg-muted/60 px-4 py-3 text-sm text-muted-foreground">{t.daily.submitting}</p>
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
      {status === "invalid-score" && <p className="text-sm text-destructive">{t.daily.submitInvalidScore}</p>}

      <Button type="submit">{t.daily.submit}</Button>
    </form>
  )
}
