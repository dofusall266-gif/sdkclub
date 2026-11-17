"use client"

import { useId, useState, type ReactNode } from "react"

/** Palette de visualisation (définie dans globals.css, avec une variante sombre). */
export const VIZ = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)", "var(--viz-4)", "var(--viz-5)", "var(--viz-6)"]

type Pt = { x: number; y: number }

/** Courbe lissée qui ne dépasse jamais entre deux points (interpolation monotone) : pas de creux fantôme sous zéro. */
function monotonePath(p: Pt[]): string {
  const n = p.length
  if (n === 0) return ""
  if (n === 1) return `M${p[0].x},${p[0].y}`
  if (n === 2) return `M${p[0].x},${p[0].y}L${p[1].x},${p[1].y}`
  const dx: number[] = []
  const m: number[] = []
  for (let i = 0; i < n - 1; i++) {
    dx[i] = p[i + 1].x - p[i].x
    m[i] = (p[i + 1].y - p[i].y) / dx[i]
  }
  const t: number[] = new Array(n)
  t[0] = m[0]
  t[n - 1] = m[n - 2]
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0
      t[i + 1] = 0
    } else {
      const a = t[i] / m[i]
      const b = t[i + 1] / m[i]
      const s = a * a + b * b
      if (s > 9) {
        const k = 3 / Math.sqrt(s)
        t[i] = k * a * m[i]
        t[i + 1] = k * b * m[i]
      }
    }
  }
  let d = `M${p[0].x},${p[0].y}`
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3
    d += `C${p[i].x + h},${p[i].y + t[i] * h} ${p[i + 1].x - h},${p[i + 1].y - t[i + 1] * h} ${p[i + 1].x},${p[i + 1].y}`
  }
  return d
}

/** Axe vertical « propre » : un pas rond (1, 2, 5, 10, 20, 50…) et un maximum multiple de ce pas. */
function niceScale(peak: number, integer: boolean, target = 4): { max: number; step: number } {
  if (!(peak > 0)) return { max: integer ? target : 1, step: integer ? 1 : 0.25 }
  const rough = peak / target
  const mag = 10 ** Math.floor(Math.log10(rough))
  const norm = rough / mag
  let step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag
  if (integer && step < 1) step = 1
  return { max: Math.ceil(peak / step) * step, step }
}

const compact = (v: number) => (Math.abs(v) >= 10_000 ? `${Math.round(v / 1000)} k` : Math.round(v * 100) / 100).toString().replace(".", ",")

// ───────────────────────────── Courbes ─────────────────────────────

export interface LineSeries {
  id: string
  label: string
  /** Couleur CSS (ex. « var(--primary) »). */
  color: string
  values: (number | null)[]
  dashed?: boolean
  /** Dégradé sous la courbe, façon YouTube Studio. */
  area?: boolean
  /** Libellé affiché dans l'infobulle à la place de `label` (ex. la date de la période précédente). */
  titles?: string[]
}

interface LineChartProps {
  labels: string[]
  /** Titre de l'infobulle pour chaque point (par défaut : le libellé de l'axe). */
  titles?: string[]
  series: LineSeries[]
  format?: (v: number) => string
  /** Alternative sérialisable à `format` (utilisable depuis un composant serveur) : « percent » → 62 %. */
  valueFormat?: "number" | "percent"
  /** Format des valeurs dans l'infobulle (par défaut : celui de l'axe, en plus précis si besoin). */
  tipFormat?: (v: number) => string
  /** Borne haute fixe (ex. 100 pour un pourcentage). */
  yMax?: number
  integer?: boolean
  height?: number
  /** Affiche un rond sur chaque point (utile quand il y a peu de points). */
  dots?: boolean
  /** Lignes supplémentaires dans l'infobulle, une entrée par point. */
  extras?: ReactNode[]
  ariaLabel: string
}

const W = 760
const PAD = { top: 16, right: 18, bottom: 30, left: 46 }

/** Graphique en courbes lissées avec survol (ou toucher sur mobile) : ligne verticale, point et infobulle. */
export function LineChart({ labels, titles, series, format: formatProp, valueFormat, tipFormat, yMax, integer = true, height = 280, dots, extras, ariaLabel }: LineChartProps) {
  const uid = useId().replace(/:/g, "")
  const [hover, setHover] = useState<number | null>(null)
  const format = formatProp ?? (valueFormat === "percent" ? (v: number) => `${Math.round(v)} %` : compact)
  const H = height
  const innerW = W - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const n = labels.length

  const peak = Math.max(0, ...series.flatMap((s) => s.values.filter((v): v is number => v !== null)))
  const scale = yMax ? { max: yMax, step: yMax / 4 } : niceScale(peak, integer)
  const ticks = Array.from({ length: Math.round(scale.max / scale.step) + 1 }, (_, i) => i * scale.step)
  const x = (i: number) => (n <= 1 ? PAD.left + innerW / 2 : PAD.left + (innerW * i) / (n - 1))
  const y = (v: number) => PAD.top + innerH - (v / scale.max) * innerH
  const base = PAD.top + innerH

  const labelEvery = Math.max(1, Math.ceil(n / 8))

  const indexFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    return Math.max(0, Math.min(n - 1, Math.round(((px - PAD.left) / innerW) * (n - 1))))
  }

  // Une courbe = plusieurs tronçons si des valeurs manquent (aucun point plutôt qu'un faux zéro).
  const runs = (values: (number | null)[]) => {
    const out: { i: number; v: number }[][] = []
    let cur: { i: number; v: number }[] = []
    values.forEach((v, i) => {
      if (v === null || v === undefined) {
        if (cur.length) out.push(cur)
        cur = []
      } else cur.push({ i, v })
    })
    if (cur.length) out.push(cur)
    return out
  }

  const tipLeft = hover !== null ? (x(hover) / W) * 100 : 0
  const title = hover !== null ? (titles?.[hover] ?? labels[hover]) : ""

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-pan-y select-none"
        role="img"
        aria-label={ariaLabel}
        onPointerMove={(e) => setHover(indexFromEvent(e))}
        onPointerDown={(e) => setHover(indexFromEvent(e))}
        onPointerLeave={() => setHover(null)}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.id} id={`${uid}-${s.id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: s.color, stopOpacity: 0.28 }} />
              <stop offset="100%" style={{ stopColor: s.color, stopOpacity: 0.02 }} />
            </linearGradient>
          ))}
        </defs>

        {ticks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} className={t === 0 ? "stroke-border" : "stroke-border/60"} strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 3.5} textAnchor="end" className="fill-muted-foreground" fontSize={10.5}>
              {format(t)}
            </text>
          </g>
        ))}

        {labels.map((l, i) =>
          i % labelEvery === 0 ? (
            <text key={i} x={x(i)} y={H - 9} textAnchor="middle" className="fill-muted-foreground" fontSize={10.5}>
              {l}
            </text>
          ) : null,
        )}

        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={base} className="stroke-muted-foreground/50" strokeWidth={1} strokeDasharray="3 3" />}

        {series.map((s) =>
          runs(s.values).map((run, k) => {
            const pts = run.map((r) => ({ x: x(r.i), y: y(r.v) }))
            const line = monotonePath(pts)
            return (
              <g key={`${s.id}-${k}`}>
                {s.area && run.length > 1 && (
                  <path d={`${line}L${pts[pts.length - 1].x},${base}L${pts[0].x},${base}Z`} fill={`url(#${uid}-${s.id})`} />
                )}
                {run.length > 1 && (
                  <path
                    d={line}
                    fill="none"
                    style={{ stroke: s.color }}
                    strokeWidth={s.dashed ? 1.75 : 2.5}
                    strokeDasharray={s.dashed ? "5 4" : undefined}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {(dots || run.length === 1) &&
                  pts.map((p, j) => <circle key={j} cx={p.x} cy={p.y} r={3.5} style={{ fill: s.color }} className="stroke-card" strokeWidth={1.5} />)}
              </g>
            )
          }),
        )}

        {hover !== null &&
          series.map((s) => {
            const v = s.values[hover]
            return v === null || v === undefined ? null : (
              <circle key={s.id} cx={x(hover)} cy={y(v)} r={5} style={{ fill: s.color }} className="stroke-card" strokeWidth={2} />
            )
          })}
      </svg>

      {hover !== null && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-lg"
          style={{ left: `${tipLeft}%`, transform: `translateX(${tipLeft > 62 ? "calc(-100% - 12px)" : "12px"})` }}
        >
          <p className="font-semibold">{title}</p>
          <div className="mt-1.5 space-y-1">
            {series.map((s) => {
              const v = s.values[hover]
              return (
                <p key={s.id} className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <span className="size-2 rounded-full" style={{ background: s.color }} />
                    {s.titles?.[hover] ?? s.label}
                  </span>
                  <span className="font-semibold tabular-nums">{v === null || v === undefined ? "—" : (tipFormat ?? format)(v)}</span>
                </p>
              )
            })}
            {extras?.[hover]}
          </div>
        </div>
      )}
    </div>
  )
}

// ───────────────────────────── Anneau ─────────────────────────────

export interface DonutSlice {
  label: string
  value: number
  /** Texte secondaire dans la légende (ex. « 62 % terminées »). */
  detail?: string
  color?: string
}

/** Anneau avec légende : la part de chaque catégorie, survol synchronisé entre l'anneau et la légende. */
export function DonutChart({ slices, centerLabel, ariaLabel }: { slices: DonutSlice[]; centerLabel: string; ariaLabel: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const total = slices.reduce((a, s) => a + s.value, 0)
  const R = 52
  const C = 2 * Math.PI * R
  const gap = slices.filter((s) => s.value > 0).length > 1 ? 2.5 : 0
  let offset = 0
  const arcs = slices.map((s, i) => {
    const len = total > 0 ? (s.value / total) * C : 0
    const arc = { len, start: offset, color: s.color ?? VIZ[i % VIZ.length] }
    offset += len
    return arc
  })
  const pct = (v: number) => (total > 0 ? Math.round((v / total) * 100) : 0)
  const active = hover !== null ? slices[hover] : null

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
      <div className="relative size-40 shrink-0">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90" role="img" aria-label={ariaLabel}>
          <circle cx={70} cy={70} r={R} fill="none" strokeWidth={18} className="stroke-muted" />
          {arcs.map((a, i) =>
            a.len > 0 ? (
              <circle
                key={i}
                cx={70}
                cy={70}
                r={R}
                fill="none"
                style={{ stroke: a.color, transition: "stroke-width .15s" }}
                strokeWidth={hover === i ? 23 : 18}
                strokeDasharray={`${Math.max(0, a.len - gap)} ${C - Math.max(0, a.len - gap)}`}
                strokeDashoffset={-a.start}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
              />
            ) : null,
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tabular-nums">{active ? `${pct(active.value)} %` : total.toLocaleString("fr-FR")}</span>
          <span className="max-w-24 truncate text-[11px] leading-tight text-muted-foreground capitalize">{active ? active.label : centerLabel}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-1">
        {slices.map((s, i) => (
          <li
            key={s.label}
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            className={`flex items-center justify-between gap-3 rounded-md px-2 py-1 text-sm transition-colors ${hover === i ? "bg-muted/60" : ""}`}
          >
            <span className="inline-flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: arcs[i].color }} />
              <span className="truncate capitalize">{s.label}</span>
            </span>
            <span className="shrink-0 whitespace-nowrap text-right tabular-nums">
              <span className="font-semibold">{pct(s.value)} %</span>
              <span className="text-xs text-muted-foreground">
                {" "}
                · {s.value.toLocaleString("fr-FR")}
                {s.detail ? ` · ${s.detail}` : ""}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ───────────────────────────── Carte de chaleur ─────────────────────────────

const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
const DAYS_LONG = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]

/** Activité par jour de la semaine (lignes) et par heure (colonnes) : plus la case est foncée, plus on joue. */
export function Heatmap({ grid, unit }: { grid: number[][]; unit: string }) {
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null)
  const max = Math.max(1, ...grid.flat())
  const CELL = 25
  const LEFT = 36
  const TOP = 20
  const vw = LEFT + CELL * 24
  const vh = TOP + CELL * 7

  const caption = hover
    ? `${DAYS_LONG[hover.d]}, ${hover.h} h – ${hover.h + 1} h : ${grid[hover.d][hover.h].toLocaleString("fr-FR")} ${unit}`
    : "Survole une case pour lire le nombre exact."

  return (
    <div>
      <p className="mb-2 h-5 text-sm font-medium capitalize">{caption}</p>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${vw} ${vh}`} className="min-w-[560px] w-full" role="img" aria-label={`Activité par jour et par heure (${unit})`} onPointerLeave={() => setHover(null)}>
          {Array.from({ length: 24 }, (_, h) =>
            h % 3 === 0 ? (
              <text key={h} x={LEFT + h * CELL + CELL / 2} y={13} textAnchor="middle" className="fill-muted-foreground" fontSize={10}>
                {h} h
              </text>
            ) : null,
          )}
          {grid.map((row, d) => (
            <g key={d}>
              <text x={LEFT - 8} y={TOP + d * CELL + CELL / 2 + 3.5} textAnchor="end" className="fill-muted-foreground" fontSize={10.5}>
                {DAYS[d]}
              </text>
              {row.map((n, h) => (
                <rect
                  key={h}
                  x={LEFT + h * CELL + 1}
                  y={TOP + d * CELL + 1}
                  width={CELL - 2}
                  height={CELL - 2}
                  rx={5}
                  className={n === 0 ? "fill-muted/60" : "fill-primary"}
                  fillOpacity={n === 0 ? 1 : 0.15 + 0.85 * (n / max)}
                  stroke={hover?.d === d && hover.h === h ? "var(--foreground)" : "none"}
                  strokeWidth={1.5}
                  onPointerEnter={() => setHover({ d, h })}
                  onPointerDown={() => setHover({ d, h })}
                />
              ))}
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-end gap-2 text-xs text-muted-foreground">
        <span>Moins</span>
        {[0.15, 0.35, 0.55, 0.75, 1].map((o) => (
          <span key={o} className="size-3.5 rounded-[4px] bg-primary" style={{ opacity: o }} />
        ))}
        <span>Plus</span>
      </div>
    </div>
  )
}
