"use client"

import { Check, ShieldCheck, Smartphone, Trophy, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { GOOGLE_CLIENT_ID, googleLogin, loadGoogleIdentity, setupGoogleButton } from "@/lib/account-client"
import { notifyProfileChanged, OPEN_ACCOUNT_EVENT } from "@/lib/account-events"
import { countryFlag } from "@/lib/countries"
import { useLanguage } from "@/lib/i18n/context"
import { clearPlayerProfile, getPlayerProfile, replacePlayerProfile, type PlayerProfile } from "@/lib/player"
import { clearLocalProgress } from "@/lib/points-store"

const TEXT = {
  fr: {
    title: "Sauvegarde ta progression",
    lead: "Connecte-toi ou crée ton compte gratuit en un clic avec Google.",
    b1: "Tes points et ta place au classement sont sauvegardés",
    b2: "Retrouve-les même si tu vides ton navigateur",
    b3: "Joue depuis n’importe quel appareil",
    existing: "Tu as déjà joué ici ? Tes points actuels seront rattachés automatiquement à ton compte.",
    privacy:
      "Nous ne conservons que l’identifiant anonyme fourni par Google : ni ton email, ni ton nom. Google ne se charge que lorsque tu ouvres cette fenêtre.",
    close: "Fermer",
    connecting: "Connexion en cours…",
    created: "Compte créé : ta progression est sauvegardée ✅",
    restored: "Bon retour ! Ta progression a été retrouvée ✅",
    error: "Connexion impossible pour le moment, réessaie plus tard.",
    loadError: "Impossible de charger Google. Vérifie ta connexion ou ton bloqueur de contenu.",
    notConfigured: "La connexion Google n’est pas encore activée sur ce site.",
    connectedTitle: "Tu es connecté",
    connectedLead: "Ta progression est sauvegardée : tu peux la retrouver à tout moment en te connectant avec Google.",
    signOut: "Se déconnecter",
    signOutConfirm: "Se déconnecter de cet appareil ? Tes points restent sauvegardés sur ton compte.",
    confirm: "Oui, me déconnecter",
    cancel: "Annuler",
  },
  en: {
    title: "Save your progress",
    lead: "Sign in or create your free account in one click with Google.",
    b1: "Your points and leaderboard spot are saved",
    b2: "Get them back even if you clear your browser",
    b3: "Play from any device",
    existing: "Already played here? Your current points will be attached to your account automatically.",
    privacy:
      "We only keep the anonymous identifier provided by Google: no email, no name. Google only loads when you open this window.",
    close: "Close",
    connecting: "Signing in…",
    created: "Account created: your progress is saved ✅",
    restored: "Welcome back! Your progress has been recovered ✅",
    error: "Couldn’t sign in right now, please try again later.",
    loadError: "Couldn’t load Google. Check your connection or your content blocker.",
    notConfigured: "Google sign-in isn’t enabled on this site yet.",
    connectedTitle: "You’re signed in",
    connectedLead: "Your progress is saved: you can get it back anytime by signing in with Google.",
    signOut: "Sign out",
    signOutConfirm: "Sign out on this device? Your points stay saved on your account.",
    confirm: "Yes, sign me out",
    cancel: "Cancel",
  },
} as const

type Status = "idle" | "busy" | "created" | "restored" | "error" | "load-error"

/** Fenêtre de connexion / création de compte Google. Montée une seule fois dans la coquille du site ; s'ouvre via `openAccountDialog()`. */
export function AccountDialog() {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const [open, setOpen] = useState(false)
  const [profile, setProfile] = useState<PlayerProfile | null>(null)
  const [status, setStatus] = useState<Status>("idle")
  const [confirmOut, setConfirmOut] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  const linked = profile?.linked === true
  const configured = GOOGLE_CLIENT_ID !== ""

  useEffect(() => {
    const onOpen = () => {
      setProfile(getPlayerProfile())
      setStatus("idle")
      setConfirmOut(false)
      setOpen(true)
    }
    window.addEventListener(OPEN_ACCOUNT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_ACCOUNT_EVENT, onOpen)
  }, [])

  // Échap ferme cette fenêtre (en phase de capture, pour ne pas fermer aussi le récapitulatif de partie derrière).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      e.stopPropagation()
      setOpen(false)
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [open])

  useEffect(() => {
    if (!open || linked || !configured) return
    let cancelled = false
    loadGoogleIdentity()
      .then((api) => {
        if (cancelled || !buttonRef.current) return
        setupGoogleButton(api, buttonRef.current, locale, async (credential) => {
          setStatus("busy")
          const local = getPlayerProfile()
          const res = await googleLogin(credential, local)
          if (!res.ok || !res.playerId || !res.pseudo) return setStatus("error")
          const next: PlayerProfile = {
            id: res.playerId,
            pseudo: res.pseudo,
            countryCode: res.countryCode ?? local?.countryCode ?? (locale === "fr" ? "FR" : "US"),
            auto: local?.id === res.playerId ? local.auto : false,
            linked: true,
          }
          replacePlayerProfile(next)
          setProfile(next)
          setStatus(res.created ? "created" : "restored")
          notifyProfileChanged()
        })
      })
      .catch(() => !cancelled && setStatus("load-error"))
    return () => {
      cancelled = true
    }
  }, [open, linked, configured, locale])

  if (!open) return null

  const signOut = () => {
    clearPlayerProfile()
    clearLocalProgress()
    setProfile(null)
    setOpen(false)
    notifyProfileChanged()
  }

  const benefits = [
    { icon: Trophy, text: x.b1 },
    { icon: ShieldCheck, text: x.b2 },
    { icon: Smartphone, text: x.b3 },
  ]

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={linked ? x.connectedTitle : x.title}
        onClick={(e) => e.stopPropagation()}
        className="animate-card-pop relative max-h-[92dvh] w-full max-w-sm overflow-y-auto rounded-3xl bg-card p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={x.close}
          title={x.close}
          className="absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-secondary text-foreground/80 transition-colors hover:bg-secondary/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <X className="size-4" />
        </button>

        {linked && profile ? (
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
              <Check className="size-6" />
            </div>
            <h2 className="mt-3 text-xl font-bold">{x.connectedTitle}</h2>
            <p className="mt-1 text-lg font-semibold">
              <span aria-hidden="true">{countryFlag(profile.countryCode)}</span> {profile.pseudo}
            </p>
            {status === "created" && <p className="mt-3 text-sm font-medium text-primary">{x.created}</p>}
            {status === "restored" && <p className="mt-3 text-sm font-medium text-primary">{x.restored}</p>}
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{x.connectedLead}</p>
            <div className="mt-5 flex flex-col gap-2">
              <Button onClick={() => setOpen(false)}>{x.close}</Button>
              {confirmOut ? (
                <div className="rounded-xl border border-border p-3 text-sm">
                  <p className="text-muted-foreground">{x.signOutConfirm}</p>
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="destructive" onClick={signOut}>
                      {x.confirm}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setConfirmOut(false)}>
                      {x.cancel}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button variant="ghost" onClick={() => setConfirmOut(true)}>
                  {x.signOut}
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <h2 className="pr-10 text-xl font-bold">{x.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{x.lead}</p>
            <ul className="mt-4 space-y-2.5">
              {benefits.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Icon className="size-3.5" />
                  </span>
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex flex-col items-center gap-3">
              {configured ? <div ref={buttonRef} className="flex min-h-[44px] w-full justify-center" /> : null}
              {!configured && <p className="text-center text-sm text-destructive">{x.notConfigured}</p>}
              {status === "busy" && <p className="text-sm text-muted-foreground">{x.connecting}</p>}
              {status === "error" && <p className="text-center text-sm text-destructive">{x.error}</p>}
              {status === "load-error" && <p className="text-center text-sm text-destructive">{x.loadError}</p>}
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground">{x.existing}</p>
            <p className="mt-2 text-center text-xs text-muted-foreground">{x.privacy}</p>
          </div>
        )}
      </div>
    </div>
  )
}
