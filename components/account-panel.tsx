"use client"

import { useEffect, useRef, useState } from "react"

import { GOOGLE_CLIENT_ID, googleLogin, loadGoogleIdentity } from "@/lib/account-client"
import { useLanguage } from "@/lib/i18n/context"
import { clearPlayerProfile, getPlayerProfile, replacePlayerProfile, type PlayerProfile } from "@/lib/player"
import { clearLocalProgress } from "@/lib/points-store"

const TEXT = {
  fr: {
    open: "Sauvegarder ma progression · Retrouver mon compte",
    intro:
      "Connecte-toi avec Google pour garder tes points même si tu vides ton navigateur ou changes d’appareil. Tu avais déjà un compte ? Connecte-toi de la même façon : tu retrouveras ton pseudo et ta place au classement.",
    privacy:
      "Nous ne conservons que l’identifiant anonyme fourni par Google (ni ton email, ni ton nom). Le bouton Google ne se charge que lorsque tu ouvres ce panneau.",
    close: "Fermer",
    connecting: "Connexion…",
    created: "Ta progression est maintenant sauvegardée ✅",
    restored: "Bon retour ! Ta progression a été retrouvée ✅",
    error: "Connexion impossible pour le moment, réessaie plus tard.",
    loadError: "Impossible de charger Google. Vérifie ta connexion ou ton bloqueur de contenu.",
    linked: "Progression sauvegardée avec Google ✅",
    signOut: "Se déconnecter",
    signOutConfirm:
      "Se déconnecter de cet appareil ? Tes points restent sauvegardés : tu les retrouveras en te reconnectant avec Google.",
  },
  en: {
    open: "Save my progress · Recover my account",
    intro:
      "Sign in with Google to keep your points even if you clear your browser or switch devices. Already have an account? Sign in the same way: you’ll get your nickname and leaderboard spot back.",
    privacy:
      "We only keep the anonymous identifier provided by Google (no email, no name). The Google button only loads when you open this panel.",
    close: "Close",
    connecting: "Signing in…",
    created: "Your progress is now saved ✅",
    restored: "Welcome back! Your progress has been recovered ✅",
    error: "Couldn’t sign in right now, please try again later.",
    loadError: "Couldn’t load Google. Check your connection or your content blocker.",
    linked: "Progress saved with Google ✅",
    signOut: "Sign out",
    signOutConfirm:
      "Sign out on this device? Your points stay saved: you’ll get them back by signing in with Google again.",
  },
} as const

interface Props {
  /** Profil local (null si l'appareil n'en a pas encore, par exemple après un vidage du navigateur). */
  profile: PlayerProfile | null
  /** Appelé après une connexion (nouveau profil) ou une déconnexion (null). */
  onChange: (profile: PlayerProfile | null) => void
  className?: string
}

/** Connexion Google optionnelle : sauvegarde la progression et permet de la retrouver sur un autre appareil. */
export function AccountPanel({ profile, onChange, className }: Props) {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "busy" | "created" | "restored" | "error" | "load-error">("idle")
  const buttonRef = useRef<HTMLDivElement>(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useEffect(() => {
    if (!open) return
    let cancelled = false
    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !buttonRef.current) return
        google.initialize({
          client_id: GOOGLE_CLIENT_ID,
          auto_select: false,
          callback: async ({ credential }) => {
            if (!credential) return setStatus("error")
            setStatus("busy")
            const res = await googleLogin(credential, getPlayerProfile())
            if (!res.ok || !res.playerId || !res.pseudo) return setStatus("error")
            const local = getPlayerProfile()
            const next: PlayerProfile = {
              id: res.playerId,
              pseudo: res.pseudo,
              countryCode: res.countryCode ?? local?.countryCode ?? (locale === "fr" ? "FR" : "US"),
              auto: local?.id === res.playerId ? local.auto : false,
              linked: true,
            }
            replacePlayerProfile(next)
            setStatus(res.created ? "created" : "restored")
            setOpen(false)
            onChangeRef.current(next)
          },
        })
        buttonRef.current.innerHTML = ""
        google.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "pill",
          locale,
        })
      })
      .catch(() => !cancelled && setStatus("load-error"))
    return () => {
      cancelled = true
    }
  }, [open, locale])

  // Sans identifiant client Google configuré, la fonctionnalité reste invisible.
  if (!GOOGLE_CLIENT_ID) return null

  if (profile?.linked) {
    return (
      <div className={className}>
        <p>
          {x.linked}{" "}
          <button
            type="button"
            className="underline underline-offset-4 hover:text-foreground"
            onClick={() => {
              if (!window.confirm(x.signOutConfirm)) return
              clearPlayerProfile()
              clearLocalProgress()
              setStatus("idle")
              onChange(null)
            }}
          >
            {x.signOut}
          </button>
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      {status === "created" && <p className="text-primary">{x.created}</p>}
      {status === "restored" && <p className="text-primary">{x.restored}</p>}
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setStatus("idle")
            setOpen(true)
          }}
          className="underline underline-offset-4 hover:text-foreground"
        >
          {x.open}
        </button>
      ) : (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background/60 p-3">
          <p className="leading-relaxed">{x.intro}</p>
          <div ref={buttonRef} className="min-h-[44px]" />
          {status === "busy" && <p>{x.connecting}</p>}
          {status === "error" && <p className="text-destructive">{x.error}</p>}
          {status === "load-error" && <p className="text-destructive">{x.loadError}</p>}
          <p className="text-muted-foreground">{x.privacy}</p>
          <div>
            <button type="button" onClick={() => setOpen(false)} className="underline underline-offset-4 hover:text-foreground">
              {x.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
