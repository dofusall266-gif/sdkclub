"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"

export function LanguageToggle() {
  const { locale, setLocale, t } = useLanguage()

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t.languageToggle.label}
      onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
      className="px-2.5 text-xs font-semibold uppercase tracking-wide"
    >
      {locale === "fr" ? "EN" : "FR"}
    </Button>
  )
}
