import Link from "next/link"

import { SudokuLogo } from "@/components/sudoku-logo"

const LEGAL_LINKS = [
  { href: "/politique-de-confidentialite", label: "Politique de confidentialité" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/contact", label: "Contact" },
]

const GAME_LINKS = [
  { href: "/", label: "Jouer au sudoku" },
  { href: "/regles", label: "Règles du sudoku" },
  { href: "/techniques", label: "Techniques et astuces" },
]

export function SiteFooter() {
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
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Jouez au sudoku gratuitement en ligne. Des grilles uniques générées à l&apos;infini, sur mobile comme sur
            ordinateur.
          </p>
        </div>

        <nav aria-label="Le jeu">
          <h2 className="text-sm font-semibold">Le jeu</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {GAME_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground transition-colors hover:text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informations légales">
          <h2 className="text-sm font-semibold">Informations</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LEGAL_LINKS.map((link) => (
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
            © {new Date().getFullYear()} sudoku-club.com — Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}
