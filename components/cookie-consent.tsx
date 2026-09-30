"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { CONSENT_KEY, setConsent } from "@/lib/consent"
import { useLanguage } from "@/lib/i18n/context"

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
      aria-label="Consentement aux cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-md print:hidden"
    >
      <div className="mx-auto flex w-full max-w-6xl lg:max-w-7xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:gap-8 md:px-6 md:py-8 lg:py-10">
        <p className="text-base leading-relaxed text-muted-foreground md:text-xl lg:text-2xl">
          {t.cookie.message}{" "}
          <Link href="/politique-de-confidentialite" className="font-medium text-primary underline-offset-4 hover:underline">
            {t.cookie.policyLink}
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-3 md:gap-4">
          <Button variant="outline" size="lg" className="h-11 flex-1 px-6 text-base md:h-14 md:flex-none md:px-10 md:text-lg lg:h-16 lg:px-12 lg:text-xl" onClick={() => decide("refused")}>
            {t.cookie.refuse}
          </Button>
          <Button size="lg" className="h-11 flex-1 px-6 text-base md:h-14 md:flex-none md:px-10 md:text-lg lg:h-16 lg:px-12 lg:text-xl" onClick={() => decide("accepted")}>
            {t.cookie.accept}
          </Button>
        </div>
      </div>
    </div>
  )
}
