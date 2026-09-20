import type { ReactNode } from "react"

/**
 * Gabarit commun aux pages de contenu.
 * Les emplacements publicitaires manuels ont été retirés le 20/09/2026 pour
 * tester Google Auto ads (placement automatique). Voir git/historique si besoin
 * de revenir aux emplacements fixes (top-banner, sidebar, bottom-banner) —
 * le composant AdSlot est toujours disponible dans components/ad-slot.tsx.
 */
export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
