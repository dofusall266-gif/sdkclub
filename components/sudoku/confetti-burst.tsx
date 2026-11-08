"use client"

import { useMemo } from "react"

const COLORS = ["var(--primary)", "var(--color-flash)", "var(--accent)", "var(--chart-4)", "var(--destructive)"]

/** Explosion de confettis plein écran (aux couleurs du site), jouée une fois à l'affichage. */
export function ConfettiBurst({ count = 40 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = Math.random() * Math.PI * 2
        const dist = 90 + Math.random() * 230
        return {
          id: i,
          bx: Math.cos(angle) * dist,
          by: Math.sin(angle) * dist + 80,
          size: 6 + Math.random() * 5,
          color: COLORS[i % COLORS.length],
        }
      }),
    [count],
  )
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="animate-burst-fly absolute top-[42%] left-1/2 rounded-sm"
          style={
            {
              width: p.size,
              height: p.size * 0.5,
              backgroundColor: p.color,
              "--bx": `${p.bx}px`,
              "--by": `${p.by}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
