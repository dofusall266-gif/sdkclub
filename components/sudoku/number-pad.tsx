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
    <div className="w-full" role="group" aria-label={locale === "fr" ? "Pavé numérique" : "Number pad"}>
      <div className="mx-auto grid w-full grid-cols-9 gap-1.5 sm:gap-2">
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
                "flex aspect-square flex-col items-center justify-center rounded-lg border border-border bg-card text-lg font-semibold text-foreground transition-colors sm:text-xl",
                "hover:border-primary hover:bg-primary/10 hover:text-primary active:bg-primary/10",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              {n}
              <span className="text-[0.55rem] font-normal leading-none text-muted-foreground sm:text-[0.65rem]">
                {9 - placed}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
