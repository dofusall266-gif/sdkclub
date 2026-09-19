"use client"

import { Mail } from "lucide-react"
import Link from "next/link"

import { SudokuLogo } from "@/components/sudoku-logo"
import { useLanguage } from "@/lib/i18n/context"
import { CONTACT_EMAIL } from "@/lib/site-config"

export function SiteFooter() {
  const { t } = useLanguage()

  const legalLinks = [
    { href: "/politique-de-confidentialite", label: t.footer.privacy },
    { href: "/mentions-legales", label: t.footer.legal },
    { href: "/contact", label: t.footer.contact },
  ]

  const gameLinks = [
    { href: "/", label: t.footer.play },
    { href: "/regles", label: t.footer.rules },
    { href: "/techniques", label: t.footer.techniques },
  ]

  return (
    <footer className="border-t border-border bg-secondary/40 print:hidden">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <SudokuLogo className="size-8" />
            <span className="text-base font-bold tracking-tight">
              Sudoku<span className="text-primary">Club</span>
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">{t.footer.tagline}</p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Mail className="size-4" />
            {CONTACT_EMAIL}
          </a>
        </div>

        <nav aria-label={t.footer.gameHeading}>
          <h2 className="text-sm font-semibold">{t.footer.gameHeading}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {gameLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label={t.footer.legalHeading}>
          <h2 className="text-sm font-semibold">{t.footer.legalHeading}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} sudoku-club.com — {t.footer.rights}
          </p>
        </div>
      </div>
    </footer>
  )
}
