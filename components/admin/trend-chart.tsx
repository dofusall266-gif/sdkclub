/** Graphique en barres des 30 derniers jours (SVG pur, rendu côté serveur : aucun JavaScript envoyé au navigateur).
 * Pour chaque jour : parties lancées (barre claire) et parties gagnées (barre verte).
 * Les jours sans aucune partie sont affichés à zéro, pour que les creux se voient. */
export interface TrendPoint {
  day: string // « DD/MM »
  started: number
  won: number
}

export function TrendChart({ points }: { points: TrendPoint[] }) {
  const W = 720
  const H = 220
  const pad = { top: 12, right: 8, bottom: 26, left: 30 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const peak = Math.max(1, ...points.map((p) => p.started))
  // Échelle « ronde » pour l'axe vertical (4, 5, 10, 20, 50…)
  const step = peak <= 4 ? 1 : peak <= 10 ? 2 : peak <= 20 ? 5 : peak <= 50 ? 10 : 20
  const max = Math.ceil(peak / step) * step
  const ticks = Array.from({ length: max / step + 1 }, (_, i) => i * step)

  const slot = innerW / points.length
  const barW = Math.max(3, slot * 0.34)
  const y = (v: number) => pad.top + innerH - (v / max) * innerH

  const totalStarted = points.reduce((a, p) => a + p.started, 0)
  const totalWon = points.reduce((a, p) => a + p.won, 0)

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-muted-foreground/50" /> Lancées ({totalStarted})
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-primary" /> Gagnées ({totalWon})
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Parties lancées et gagnées par jour sur 30 jours">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
            <text x={pad.left - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={10}>
              {t}
            </text>
          </g>
        ))}
        {points.map((p, i) => {
          const cx = pad.left + slot * i + slot / 2
          return (
            <g key={p.day}>
              <title>{`${p.day} : ${p.started} lancées, ${p.won} gagnées`}</title>
              <rect
                x={cx - barW - 0.5}
                y={y(p.started)}
                width={barW}
                height={Math.max(0, innerH - (y(p.started) - pad.top))}
                rx={1.5}
                className="fill-muted-foreground/50"
              />
              <rect
                x={cx + 0.5}
                y={y(p.won)}
                width={barW}
                height={Math.max(0, innerH - (y(p.won) - pad.top))}
                rx={1.5}
                className="fill-primary"
              />
              {(i % 5 === 0 || i === points.length - 1) && (
                <text x={cx} y={H - 8} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>
                  {p.day}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
