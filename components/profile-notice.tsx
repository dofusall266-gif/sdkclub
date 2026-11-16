"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { countryFlag, sortedCountries } from "@/lib/countries"
import { useLanguage } from "@/lib/i18n/context"
import { clearPlayerProfile, savePlayerProfile, setLeaderboardOptOut, type PlayerProfile } from "@/lib/player"
import { leaveLeaderboard, syncProfile } from "@/lib/profile-client"

const TEXT = {
  fr: {
    as: "Tu apparais au classement sous le nom",
    publicNote: "Ton pseudo et ton pays sont visibles de tous.",
    edit: "Modifier",
    leave: "Ne plus apparaître",
    leaving: "Retrait…",
    left: "Tes scores ont été retirés du classement.",
    leaveError: "Retrait impossible pour le moment, réessaie plus tard.",
    pseudo: "Pseudo",
    country: "Pays",
    save: "Enregistrer",
    saving: "Enregistrement…",
    cancel: "Annuler",
    pseudoError: "Pseudo invalide (1 à 20 caractères, sans mot interdit).",
    saveError: "Modification impossible pour le moment, réessaie plus tard.",
  },
  en: {
    as: "You appear on the leaderboard as",
    publicNote: "Your nickname and country are visible to everyone.",
    edit: "Edit",
    leave: "Stop appearing",
    leaving: "Removing…",
    left: "Your scores have been removed from the leaderboard.",
    leaveError: "Couldn’t remove them right now, please try again later.",
    pseudo: "Nickname",
    country: "Country",
    save: "Save",
    saving: "Saving…",
    cancel: "Cancel",
    pseudoError: "Invalid nickname (1 to 20 characters, no banned word).",
    saveError: "Couldn’t save the change right now, please try again later.",
  },
} as const

interface Props {
  profile: PlayerProfile
  /** Appelé après une modification réussie (pseudo / pays). */
  onChange: (profile: PlayerProfile) => void
  /** Appelé après le retrait du classement. */
  onLeave: () => void
  className?: string
}

/** Ligne discrète « Tu apparais au classement sous le nom X » avec Modifier / Ne plus apparaître. */
export function ProfileNotice({ profile, onChange, onLeave, className }: Props) {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const [editing, setEditing] = useState(false)
  const [pseudo, setPseudo] = useState(profile.pseudo)
  const [country, setCountry] = useState(profile.countryCode)
  const [busy, setBusy] = useState<"idle" | "saving" | "leaving">("idle")
  const [error, setError] = useState<string | null>(null)
  const countries = sortedCountries(locale)

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = pseudo.trim()
    if (trimmed.length < 1 || trimmed.length > 20) return setError(x.pseudoError)
    setBusy("saving")
    setError(null)
    const next = savePlayerProfile(trimmed, country)
    const res = await syncProfile(next)
    setBusy("idle")
    if (!res.ok && res.reason === "invalid-pseudo") {
      // Refusé par le serveur : on remet l'ancien profil.
      savePlayerProfile(profile.pseudo, profile.countryCode)
      return setError(x.pseudoError)
    }
    // Hors-ligne / base injoignable : le profil local est à jour, il sera répercuté à la prochaine partie.
    if (!res.ok && res.reason !== "no-database" && res.reason !== "network") return setError(x.saveError)
    setEditing(false)
    onChange(next)
  }

  const leave = async () => {
    setBusy("leaving")
    setError(null)
    const res = await leaveLeaderboard(profile)
    setBusy("idle")
    if (!res.ok && res.reason !== "no-database") return setError(x.leaveError)
    setLeaderboardOptOut(true)
    clearPlayerProfile()
    onLeave()
  }

  if (editing) {
    return (
      <form onSubmit={save} className={`flex flex-col gap-2 rounded-xl border border-border bg-background/60 p-3 ${className ?? ""}`}>
        <div className="flex gap-2">
          <input
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            maxLength={20}
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
        {error && <p className="text-xs text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={busy !== "idle"}>
            {busy === "saving" ? x.saving : x.save}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            {x.cancel}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div className={`text-xs text-muted-foreground ${className ?? ""}`}>
      <p>
        {x.as}{" "}
        <b className="text-foreground">
          {countryFlag(profile.countryCode)} {profile.pseudo}
        </b>
        . {x.publicNote}
      </p>
      <p className="mt-1 flex flex-wrap gap-x-3">
        <button type="button" onClick={() => setEditing(true)} className="underline underline-offset-4 hover:text-foreground">
          {x.edit}
        </button>
        <button
          type="button"
          onClick={leave}
          disabled={busy !== "idle"}
          className="underline underline-offset-4 hover:text-foreground disabled:opacity-50"
        >
          {busy === "leaving" ? x.leaving : x.leave}
        </button>
      </p>
      {error && <p className="mt-1 text-destructive">{error}</p>}
    </div>
  )
}

export const PROFILE_LEFT_TEXT = { fr: TEXT.fr.left, en: TEXT.en.left } as const
