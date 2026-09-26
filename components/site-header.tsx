"use client"

import { Menu, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { LanguageToggle } from "@/components/language-toggle"
import { StreakBadge } from "@/components/streak-badge"
import { SudokuLogo } from "@/components/sudoku-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { hasCompletedDailyToday } from "@/lib/daily"
import { useLanguage } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

export function SiteHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [dailyDone, setDailyDone] = useState(true) // true par défaut : pas de pastille tant qu'on n'a pas vérifié (évite un flash au chargement)
  const { t } = useLanguage()

  useEffect(() => {
    const check = () => setDailyDone(hasCompletedDailyToday())
    check()
    window.addEventListener("sc:streak-updated", check)
    return () => window.removeEventListener("sc:streak-updated", check)
  }, [])

  const navLinks: { href: string; label: string; dot?: boolean }[] = [
    { href: "/", label: t.nav.play },
    { href: "/defi", label: t.nav.daily, dot: !dailyDone },
    { href: "/regles", label: t.nav.rules },
    { href: "/techniques", label: t.nav.techniques },
    { href: "/blog", label: t.nav.blog },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <SudokuLogo className="size-9" />
          <span className="text-lg font-bold tracking-tight">
            Sudoku<span className="text-primary">Club</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {navLinks.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                <span className="relative">
                  {link.label}
                  {link.dot && (
                    <span className="absolute -right-2 -top-0.5 size-1.5 rounded-full bg-orange-500" aria-hidden="true" />
                  )}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <StreakBadge className="hidden sm:flex" />
          <LanguageToggle />
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Ouvrir le menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background md:hidden" aria-label="Navigation mobile">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            {navLinks.map((link) => {
              const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <span className="relative">
                    {link.label}
                    {link.dot && (
                      <span className="absolute -right-2 -top-0.5 size-1.5 rounded-full bg-orange-500" aria-hidden="true" />
                    )}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </header>
  )
}
