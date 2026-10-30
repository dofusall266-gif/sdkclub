"use client"

import { useState } from "react"

/** Un point du graphique = un jour (ou une semaine pour les longues périodes). */
export interface ChartPoint {
  label: string // axe : « 28/10 »
  title: string // infobulle : « Mardi 28/10 » ou « Semaine du 27/10 »
  started: number
  won: number
  visitors: number
  sessions: number
  minutes: number
  participants: number
}

interface Series {
  key: keyof Omit<ChartPoint, "label" | "title">
  label: string
  swatch: string // classe du carré de légende
  bar: string // classe de la barre
  unit?: string
}

const GROUPS: { id: string; label: string; series: Series[] }[] = [
  {
    id: "games",
    label: "Parties",
    series: [
      { key: "started", label: "Lancées", swatch: "bg-muted-foreground/50", bar: "fill-muted-foreground/50" },
      { key: "won", label: "Gagnées", swatch: "bg-primary", bar: "fill-primary" },
    ],
  },
  {
    id: "visits",
    label: "Visites",
    series: [
      { key: "sessions", label: "Visites", swatch: "bg-muted-foreground/50", bar: "fill-muted-foreground/50" },
      { key: "visitors", label: "Visiteurs identifiés", swatch: "bg-primary", bar: "fill-primary" },
    ],
  },
  {
    id: "time",
    label: "Temps passé",
    series: [{ key: "minutes", label: "Minutes passées", swatch: "bg-primary", bar: "fill-primary", unit: "min" }],
  },
  {
    id: "daily",
    label: "Défi du jour",
    series: [{ key: "participants", label: "Classés au défi", swatch: "bg-primary", bar: "fill-primary" }],
  },
]

const W = 760
const H = 240
const PAD = { top: 12, right: 8, bottom: 28, left: 34 }

/** Graphique en barres interactif : survole (ou touche) une période pour lire les chiffres exacts. */
export function InteractiveChart({ points, unitLabel }: { points: ChartPoint[]; unitLabel: string }) {
  const [groupId, setGroupId] = useState("games")
  const [hover, setHover] = useState<number | null>(null)
  const group = GROUPS.find((g) => g.id === groupId) ?? GROUPS[0]

  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const n = points.length
  const slot = innerW / n

  const peak = Math.max(1, ...points.flatMap((p) => group.series.map((s) => p[s.key])))
  const step = peak <= 4 ? 1 : peak <= 10 ? 2 : peak <= 20 ? 5 : peak <= 50 ? 10 : peak <= 100 ? 20 : peak <= 250 ? 50 : peak <= 500 ? 100 : 250
  const max = Math.ceil(peak / step) * step
  const ticks = Array.from({ length: Math.min(8, max / step) + 1 }, (_, i) => i * (max / Math.min(8, max / step)))
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH

  const barW = Math.max(2, (slot * 0.74) / group.series.length)
  const labelEvery = n > 60 ? 8 : n > 40 ? 6 : n > 14 ? 5 : 1

  const indexFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * W - PAD.left
    return Math.max(0, Math.min(n - 1, Math.floor(x / slot)))
  }

  const hp = hover !== null ? points[hover] : null
  const tooltipLeft = hover !== null ? ((PAD.left + slot * hover + slot / 2) / W) * 100 : 0

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1 rounded-lg border border-border p-0.5 text-sm" role="tablist" aria-label="Mesure affichée">
          {GROUPS.map((g) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={g.id === groupId}
              onClick={() => setGroupId(g.id)}
              className={`rounded-md px-3 py-1 ${g.id === groupId ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {group.series.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5">
              <span className={`size-2.5 rounded-sm ${s.swatch}`} /> {s.label} ({Math.round(points.reduce((a, p) => a + p[s.key], 0)).toLocaleString("fr-FR")})
            </span>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-pan-y"
          role="img"
          aria-label={`${group.label} par ${unitLabel}`}
          onPointerMove={(e) => setHover(indexFromEvent(e))}
          onPointerDown={(e) => setHover(indexFromEvent(e))}
          onPointerLeave={() => setHover(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className="stroke-border" strokeWidth={1} />
              <text x={PAD.left - 6} y={y(t) + 3} textAnchor="end" className="fill-muted-foreground" fontSize={10}>
                {Math.round(t * 10) / 10}
              </text>
            </g>
          ))}

          {hover !== null && (
            <rect x={PAD.left + slot * hover} y={PAD.top} width={slot} height={innerH} className="fill-foreground/5" />
          )}

          {points.map((p, i) => {
            const groupW = barW * group.series.length
            const x0 = PAD.left + slot * i + (slot - groupW) / 2
            return (
              <g key={p.title + i}>
                {group.series.map((s, k) => (
                  <rect
                    key={s.key}
                    x={x0 + barW * k}
                    y={y(p[s.key])}
                    width={Math.max(1, barW - 0.5)}
                    height={Math.max(0, PAD.top + innerH - y(p[s.key]))}
                    rx={1.5}
                    className={`${s.bar} ${hover === i ? "opacity-100" : hover === null ? "" : "opacity-60"}`}
                  />
                ))}
                {(i % labelEvery === 0 || i === n - 1) && (
                  <text x={PAD.left + slot * i + slot / 2} y={H - 9} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>
                    {p.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {hp && (
          <div
            className="pointer-events-none absolute top-1 z-10 min-w-36 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg"
            style={{ left: `${tooltipLeft}%`, transform: `translateX(${tooltipLeft > 70 ? "-105%" : "5%"})` }}
          >
            <p className="font-semibold">{hp.title}</p>
            <div className="mt-1 space-y-0.5">
              {group.series.map((s) => (
                <p key={s.key} className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className={`size-2 rounded-sm ${s.swatch}`} /> {s.label}
                  </span>
                  <span className="font-semibold tabular-nums">
                    {Math.round(hp[s.key] * 10) / 10}
                    {s.unit ? ` ${s.unit}` : ""}
                  </span>
                </p>
              ))}
              {group.id === "games" && hp.started > 0 && (
                <p className="flex items-center justify-between gap-4 border-t border-border pt-1">
                  <span className="text-muted-foreground">Réussite</span>
                  <span className="font-semibold tabular-nums">{Math.min(100, Math.round((hp.won / hp.started) * 100))} %</span>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Survole le graphique (ou touche-le sur mobile) pour lire les chiffres exacts de chaque {unitLabel}.</p>
    </div>
  )
}
