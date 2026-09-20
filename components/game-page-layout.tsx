import type { ReactNode } from "react"

/**
 * Gabarit de la page de jeu (accueil).
 *
 * Les emplacements publicitaires manuels (colonnes latérales + bannière) ont été
 * retirés : les pubs sont désormais gérées par Google Auto ads (le script AdSense
 * est chargé dans app/layout.tsx).
 *
 * Le contenu est volontairement centré avec une largeur limitée (~928 px) pour
 * laisser de la marge de chaque côté du plateau sur grand écran — c'est cet espace
 * que Google utilise pour ses formats latéraux (« side rails »), comme sur
 * sudoku.com. Ne pas élargir ce conteneur, sinon les pubs latérales n'auront
 * plus de place pour s'afficher.
 */
export function GamePageLayout({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[58rem] px-4 py-6">{children}</div>
}
