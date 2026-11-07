"use client"

import { usePathname } from "next/navigation"

import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { localizePath } from "@/lib/i18n/paths"
import { cn } from "@/lib/utils"

/**
 * Lien vers la même page dans l'autre langue (FR ⇄ EN). C'est un vrai lien <a> (avec hreflang) :
 * Google le suit, et l'adresse change vraiment (/regles ⇄ /en/rules).
 */
export function LanguageToggle() {
  const { locale, t } = useLanguage()
  const pathname = usePathname() || "/"
  const other = locale === "fr" ? "en" : "fr"

  return (
    <a
      href={localizePath(pathname, other)}
      hrefLang={other}
      lang={other}
      aria-label={t.languageToggle.label}
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "px-2.5 text-xs font-semibold uppercase tracking-wide")}
    >
      {other.toUpperCase()}
    </a>
  )
}
