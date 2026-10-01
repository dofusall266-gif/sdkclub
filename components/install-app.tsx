"use client"

import { Download } from "lucide-react"
import { useEffect, useState } from "react"

import { useLanguage } from "@/lib/i18n/context"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Téléphone ou tablette (Android, iPhone, iPad, y compris iPadOS qui se fait passer pour un Mac). */
function isMobileOrTablet(): boolean {
  const ua = navigator.userAgent
  return /android|iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

function isIos(): boolean {
  const ua = navigator.userAgent
  return /iphone|ipad|ipod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

/** Lien « Installer l'app » du pied de page, réservé aux téléphones et tablettes :
 * sur ordinateur, personne n'a besoin d'installer le site, et l'installation
 * dépend trop du navigateur pour être proposée à tout le monde.
 * - Chrome / Edge / Android : déclenche la vraie fenêtre d'installation.
 * - iPhone / iPad (Safari n'a pas d'API) : affiche les 2 étapes à suivre.
 * - Déjà installée, ou navigateur incompatible : rien n'est affiché. */
export function InstallApp() {
  const { t } = useLanguage()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [ios, setIos] = useState(false)
  const [showIosHelp, setShowIosHelp] = useState(false)

  useEffect(() => {
    if (isStandalone() || !isMobileOrTablet()) return
    setIos(isIos())
    const onPrompt = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    const onInstalled = () => {
      setDeferred(null)
      setIos(false)
    }
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  if (!deferred && !ios) return null

  const onClick = async () => {
    if (deferred) {
      await deferred.prompt()
      await deferred.userChoice
      setDeferred(null)
    } else {
      setShowIosHelp((v) => !v)
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <Download className="size-4" />
        {t.install.button}
      </button>
      {showIosHelp && (
        <p className="mt-2 max-w-xs rounded-xl border border-border bg-card p-3 text-xs leading-relaxed text-muted-foreground">
          {t.install.iosHelp}
        </p>
      )}
    </div>
  )
}
