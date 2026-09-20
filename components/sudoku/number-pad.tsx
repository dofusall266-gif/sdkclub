"use client"

import { useLanguage } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface NumberPadProps {
  /** remaining[n] = nombre de n déjà placés (sur 9). */
  remaining: number[]
  disabled?: boolean
  onInput: (value: number) => void
}

/** Pavé numérique 3×3 (1-2-3 / 4-5-6 / 7-8-9), comme sur sudoku.com. */
export function NumberPad({ remaining, disabled, onInput }: NumberPadProps) {
  const { locale } = useLanguage()

  const label = (n: number) => (locale === "fr" ? `Placer le chiffre ${n}` : `Place the number ${n}`)

  return (
    <div className="w-full" role="group" aria-label={locale === "fr" ? "Pavé numérique" : "Number pad"}>
      <div className="grid w-full grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 9 }, (_, i) => {
          const n = i + 1
          const placed = remaining[n] ?? 0
          const left = 9 - placed
          const done = placed >= 9

          return (
            <button
              key={n}
              type="button"
              disabled={disabled || done}
              onClick={() => onInput(n)}
              aria-label={label(n)}
              className={cn(
                "relative flex h-14 items-center justify-center rounded-xl bg-primary/10 text-3xl font-medium text-primary transition-colors sm:h-16 lg:h-20 lg:text-4xl",
                "hover:bg-primary/20 active:bg-primary/25",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-30",
              )}
            >
              {n}
              {/* Nombre d'occurrences restantes à placer (discret, en coin). */}
              {!done && (
                <span className="absolute top-1.5 right-2 text-[0.65rem] font-medium leading-none text-primary/60 tabular-nums">
                  {left}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
