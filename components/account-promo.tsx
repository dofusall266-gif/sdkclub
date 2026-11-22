"use client"

import { Check, ShieldCheck } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { openAccountDialog, PROFILE_EVENT } from "@/lib/account-events"
import { useLanguage } from "@/lib/i18n/context"
import { getPlayerProfile } from "@/lib/player"
import { cn } from "@/lib/utils"

const TEXT = {
  fr: {
    title: "Ne perds plus tes points",
    text: "Crée ton compte gratuit avec Google : ta progression et ta place au classement sont sauvegardées, même si tu vides ton navigateur ou changes d’appareil.",
    cta: "Créer un compte · Se connecter",
    saved: "Progression sauvegardée avec ton compte",
  },
  en: {
    title: "Never lose your points again",
    text: "Create your free account with Google: your progress and leaderboard spot are saved, even if you clear your browser or switch devices.",
    cta: "Create account · Sign in",
    saved: "Progress saved with your account",
  },
} as const

/** Encart d'invitation à créer un compte / se connecter (fin de partie, classement, défi du jour). Discret une fois connecté. */
export function AccountPromo({ className }: { className?: string }) {
  const { locale } = useLanguage()
  const x = TEXT[locale]
  const [linked, setLinked] = useState<boolean | null>(null)

  useEffect(() => {
    const sync = () => setLinked(getPlayerProfile()?.linked === true)
    sync()
    window.addEventListener(PROFILE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(PROFILE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  if (linked === null) return null

  if (linked) {
    return (
      <p className={cn("flex items-center justify-center gap-1.5 text-xs text-muted-foreground", className)}>
        <Check className="size-3.5 text-primary" />
        {x.saved}
      </p>
    )
  }

  return (
    <div className={cn("rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left", className)}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="size-4 text-primary" />
        {x.title}
      </p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{x.text}</p>
      <Button className="mt-3 h-9 w-full" onClick={openAccountDialog}>
        {x.cta}
      </Button>
    </div>
  )
}
