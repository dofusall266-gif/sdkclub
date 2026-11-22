"use client"

import { LogIn, UserRound } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { openAccountDialog, PROFILE_EVENT } from "@/lib/account-events"
import { useLanguage } from "@/lib/i18n/context"
import { getPlayerProfile, type PlayerProfile } from "@/lib/player"
import { cn } from "@/lib/utils"

/** Bouton « Se connecter » de l'en-tête (devient le pseudo du joueur une fois connecté). */
export function AccountButton({ className, fullWidth }: { className?: string; fullWidth?: boolean }) {
  const { locale } = useLanguage()
  const [profile, setProfile] = useState<PlayerProfile | null>(null)

  useEffect(() => {
    const sync = () => setProfile(getPlayerProfile())
    sync()
    window.addEventListener(PROFILE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(PROFILE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const linked = profile?.linked === true
  const label = linked ? profile!.pseudo : locale === "fr" ? "Se connecter" : "Sign in"
  const Icon = linked ? UserRound : LogIn

  return (
    <Button
      variant={linked ? "ghost" : "outline"}
      onClick={openAccountDialog}
      aria-label={label}
      title={label}
      className={cn("gap-1.5", fullWidth ? "w-full justify-start" : "px-2 sm:px-3", className)}
    >
      <Icon className="size-4" />
      <span className={cn(fullWidth ? "" : linked ? "hidden max-w-28 truncate lg:inline" : "hidden sm:inline")}>{label}</span>
    </Button>
  )
}
