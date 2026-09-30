"use client"

import { Cookie } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { CONSENT_KEY, setConsent } from "@/lib/consent"
import { useLanguage } from "@/lib/i18n/context"

/** Bandeau de consentement aux cookies.
 * - Mobile : petite carte collée en bas de l'écran, sur presque toute la largeur.
 * - Ordinateur : carte compacte flottante en bas à gauche (24 rem), qui ne
 *   masque ni la grille ni le menu, mais reste bien lisible.
 * « Refuser » et « Accepter » ont exactement le même poids visuel (exigence
 * de la CNIL : refuser doit être aussi simple qu'accepter). */
export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
    } catch {
      // localStorage indisponible (mode privé strict) : on n'affiche rien.
    }
  }, [])

  const decide = (value: "accepted" | "refused") => {
    setConsent(value)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-border bg-card/95 p-4 shadow-2xl shadow-black/40 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-500 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[24rem] sm:p-5 print:hidden"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <Cookie className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-base font-semibold leading-tight">Cookies</p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {t.cookie.message}{" "}
            <Link
              href="/politique-de-confidentialite"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t.cookie.policyLink}
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <Button variant="outline" className="h-10" onClick={() => decide("refused")}>
          {t.cookie.refuse}
        </Button>
        <Button className="h-10" onClick={() => decide("accepted")}>
          {t.cookie.accept}
        </Button>
      </div>
    </div>
  )
}
