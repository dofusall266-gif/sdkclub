"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { CONSENT_KEY, setConsent } from "@/lib/consent"

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

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
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md print:hidden"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <p className="text-sm text-muted-foreground">
          Nous utilisons des cookies pour améliorer votre expérience et mesurer notre audience. Consultez notre{" "}
          <Link href="/politique-de-confidentialite" className="font-medium text-primary underline-offset-4 hover:underline">
            politique de confidentialité
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => decide("refused")}>
            Refuser
          </Button>
          <Button size="sm" onClick={() => decide("accepted")}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  )
}
