import type { ReactNode } from "react"

import { AdSlot } from "@/components/ad-slot"

/**
 * Gabarit commun aux pages de contenu :
 * bannière publicitaire en haut, contenu principal + colonne latérale (desktop),
 * bannière publicitaire en bas.
 */
export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6">
      <AdSlot slot="top-banner" format="banner" className="mb-6" />

      <div className="flex flex-col gap-8 lg:flex-row">
        <div className="min-w-0 flex-1">{children}</div>

        <aside className="hidden shrink-0 lg:block" aria-label="Publicité">
          <div className="sticky top-20">
            <AdSlot slot="sidebar" format="sidebar" />
          </div>
        </aside>
      </div>

      <AdSlot slot="bottom-banner" format="footer" className="mt-8" />
    </div>
  )
}
