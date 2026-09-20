import type { ReactNode } from "react"

import { AdSlot } from "@/components/ad-slot"

/**
 * Gabarit de la page de jeu (accueil) : deux colonnes publicitaires verticales
 * de part et d'autre du plateau (visibles uniquement sur grand écran, comme
 * sur sudoku.com), plus une bannière publicitaire en bas de page.
 * Les pages de contenu (Règles, Techniques, etc.) utilisent PageLayout, pas
 * celui-ci — ces colonnes latérales n'ont de sens qu'autour du plateau de jeu.
 */
export function GamePageLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <div className="mx-auto flex w-full max-w-[1600px] items-start justify-center gap-4 px-4 py-6 xl:gap-6">
        <aside className="hidden shrink-0 xl:block" aria-label="Publicité">
          <div className="sticky top-20">
            <AdSlot slot="left-rail" format="sidebar" />
          </div>
        </aside>

        <div className="w-full max-w-5xl min-w-0">{children}</div>

        <aside className="hidden shrink-0 xl:block" aria-label="Publicité">
          <div className="sticky top-20">
            <AdSlot slot="right-rail" format="sidebar" />
          </div>
        </aside>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 pb-6">
        <AdSlot slot="bottom-banner" format="footer" />
      </div>
    </div>
  )
}
