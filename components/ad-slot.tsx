import { cn } from "@/lib/utils"

interface AdSlotProps {
  /** Identifiant lisible de l'emplacement (utile pour brancher AdSense plus tard). */
  slot: string
  /** Format d'affichage : bannière horizontale ou rectangle latéral. */
  format?: "banner" | "sidebar" | "footer"
  className?: string
}

/**
 * Emplacement publicitaire réservé.
 * Remplacez le contenu de ce composant par votre code Google AdSense
 * (le conteneur porte déjà data-ad-slot pour vous repérer).
 */
export function AdSlot({ slot, format = "banner", className }: AdSlotProps) {
  const dimensions =
    format === "sidebar"
      ? "min-h-[600px] w-full max-w-[300px]"
      : format === "footer"
        ? "min-h-[90px] w-full"
        : "min-h-[90px] w-full sm:min-h-[100px]"

  return (
    <div
      data-ad-slot={slot}
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 text-center text-xs font-medium tracking-wide text-muted-foreground/70 select-none print:hidden",
        dimensions,
        className,
      )}
    >
      <span className="px-4">Emplacement publicitaire</span>
    </div>
  )
}
