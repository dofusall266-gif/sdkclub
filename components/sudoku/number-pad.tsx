"use client"

import { useLanguage } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface NumberPadProps {
  /** remaining[n] = nombre de n déjà placés (sur 9). */
  remaining: number[]
  disabled?: boolean
  onInput: (value: number) => void
}

export function NumberPad({ remaining, disabled, onInput }: NumberPadProps) {
  const { locale } = useLanguage()

  const label = (n: number) => (locale === "fr" ? `Placer le chiffre ${n}` : `Place the number ${n}`)

  return (
    <>
      {/* Ordinateur / tablette : pavé 3x3 classique, dans le flux normal de la page. */}
      <div className="mx-auto hidden w-full max-w-72 grid-cols-3 gap-2 sm:gap-2.5 lg:grid">
        {Array.from({ length: 9 }, (_, i) => {
          const n = i + 1
          const placed = remaining[n] ?? 0
          const done = placed >= 9

          return (
            <button
              key={n}
              type="button"
              disabled={disabled || done}
              onClick={() => onInput(n)}
              aria-label={label(n)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center rounded-xl border border-border bg-card text-2xl font-semibold text-foreground transition-colors sm:text-3xl",
                "hover:border-primary hover:bg-primary/10 hover:text-primary",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              {n}
              <span className="text-[0.6rem] font-normal text-muted-foreground sm:text-xs">{9 - placed}</span>
            </button>
          )
        })}
      </div>

      {/* Mobile : barre fixée en bas de l'écran, toujours visible sans avoir à scroller. */}
      <div
        className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden print:hidden"
        role="group"
        aria-label={locale === "fr" ? "Pavé numérique" : "Number pad"}
      >
        <div className="mx-auto grid w-full max-w-xl grid-cols-9 gap-1 px-2">
          {Array.from({ length: 9 }, (_, i) => {
            const n = i + 1
            const placed = remaining[n] ?? 0
            const done = placed >= 9

            return (
              <button
                key={n}
                type="button"
                disabled={disabled || done}
                onClick={() => onInput(n)}
                aria-label={label(n)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center rounded-lg border border-border bg-card text-lg font-semibold text-foreground transition-colors active:bg-primary/10",
                  "disabled:pointer-events-none disabled:opacity-40",
                )}
              >
                {n}
                <span className="text-[0.55rem] font-normal leading-none text-muted-foreground">{9 - placed}</span>
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
