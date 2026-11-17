"use client"

import { useState } from "react"

import { LineChart, type LineSeries } from "@/components/admin/charts"
import type { ChartPoint, Kpi } from "@/lib/admin-stats"

const nf = (v: number) => Math.round(v).toLocaleString("fr-FR")
const rate = (started: number, won: number) => (started > 0 ? Math.min(100, Math.round((won / started) * 100)) : null)

function fmtSeconds(v: number): string {
  const m = Math.floor(v / 60)
  const s = Math.round(v % 60)
  return `${m} min ${String(s).padStart(2, "0")} s`
}
const fmtSecondsAxis = (v: number) => (v >= 60 ? `${Math.round((v / 60) * 10) / 10} min`.replace(".", ",") : `${Math.round(v)} s`)
function fmtMinutes(min: number): string {
  if (min >= 60) {
    const h = min / 60
    return h >= 10 ? `${Math.round(h)} h` : `${(Math.round(h * 10) / 10).toString().replace(".", ",")} h`
  }
  return `${Math.round(min * 10) / 10} min`.replace(".", ",")
}

type Tone = "up" | "down" | "neutral"

interface Metric {
  id: string
  label: string
  help: string
  /** Valeur d'un point du graphique (null = pas de mesure ce jour-là). */
  at: (p: ChartPoint) => number | null
  /** Valeur de l'en-tête pour la période, et pour la précédente. */
  total: number | null
  prevTotal: number | null
  format: (v: number) => string
  /** Format de l'axe vertical (par défaut : `format`). */
  axis?: (v: number) => string
  delta: "pct" | "pts"
  /** Une hausse est-elle une bonne nouvelle ? (« neutral » = on ne colore pas). */
  tone: Tone
  yMax?: number
  integer?: boolean
}

const sum = (pts: ChartPoint[], f: (p: ChartPoint) => number) => pts.reduce((a, p) => a + f(p), 0)

function deltaOf(m: Metric): { text: string; tone: "good" | "bad" | "flat" } | null {
  if (m.total === null || m.prevTotal === null || (m.total === 0 && m.prevTotal === 0)) return null
  let diff: number
  if (m.delta === "pts") diff = Math.round(m.total - m.prevTotal)
  else if (m.prevTotal === 0) return { text: "nouveau", tone: "flat" }
  else diff = Math.round(((m.total - m.prevTotal) / m.prevTotal) * 100)
  if (diff === 0) return { text: "stable", tone: "flat" }
  const better = m.tone === "up" ? diff > 0 : m.tone === "down" ? diff < 0 : null
  return {
    text: `${diff > 0 ? "▲" : "▼"} ${Math.abs(diff)}${m.delta === "pts" ? " pts" : " %"}`,
    tone: better === null ? "flat" : better ? "good" : "bad",
  }
}

/** En-tête façon YouTube Studio : des cartes-métriques cliquables, et une grande courbe qui compare avec la période précédente. */
export function StudioOverview({
  points,
  prevPoints,
  cur,
  prev,
  bucket,
}: {
  points: ChartPoint[]
  prevPoints: ChartPoint[]
  cur: Kpi
  prev: Kpi
  bucket: "jour" | "semaine"
}) {
  const [metricId, setMetricId] = useState("started")
  const [compare, setCompare] = useState(true)

  const avgVisit = (k: Kpi) => (k.sessions > 0 ? k.playSeconds / k.sessions : null)

  const metrics: Metric[] = [
    {
      id: "started",
      label: "Parties lancées",
      help: "Dès 2 chiffres posés (parties libres + défi du jour).",
      at: (p) => p.started,
      total: cur.started,
      prevTotal: prev.started,
      format: nf,
      delta: "pct",
      tone: "up",
    },
    {
      id: "rate",
      label: "Parties terminées",
      help: "Part des parties lancées qui vont jusqu'au bout. En dessous de 50 %, on perd trop de joueurs en route.",
      at: (p) => rate(p.started, p.won),
      total: rate(cur.started, cur.won),
      prevTotal: rate(prev.started, prev.won),
      format: (v) => `${Math.round(v)} %`,
      delta: "pts",
      tone: "up",
      yMax: 100,
    },
    {
      id: "sessions",
      label: "Visites",
      help: "Chaque ouverture du site compte pour une visite.",
      at: (p) => p.sessions,
      total: cur.sessions,
      prevTotal: prev.sessions,
      format: nf,
      delta: "pct",
      tone: "up",
    },
    {
      id: "time",
      label: "Temps passé",
      help: "Temps réellement passé sur le site (onglet visible, joueur actif).",
      at: (p) => p.minutes,
      total: cur.playSeconds / 60,
      prevTotal: prev.playSeconds / 60,
      format: fmtMinutes,
      delta: "pct",
      tone: "up",
      integer: false,
    },
    {
      id: "avgVisit",
      label: "Durée d'une visite",
      help: "Temps moyen passé à chaque ouverture du site. Plus c'est long, plus les joueurs accrochent.",
      at: (p) => (p.sessions > 0 ? (p.minutes * 60) / p.sessions : null),
      total: avgVisit(cur),
      prevTotal: avgVisit(prev),
      format: fmtSeconds,
      axis: fmtSecondsAxis,
      delta: "pct",
      tone: "up",
      integer: false,
    },
    {
      id: "visitors",
      label: "Joueurs identifiés",
      help: "Seulement ceux qui ont accepté les cookies. La courbe compte les joueurs distincts de chaque période.",
      at: (p) => p.visitors,
      total: cur.visitors,
      prevTotal: prev.visitors,
      format: nf,
      delta: "pct",
      tone: "up",
    },
    {
      id: "participants",
      label: "Classés au défi",
      help: "Participations au classement du défi du jour.",
      at: (p) => p.participants,
      total: sum(points, (p) => p.participants),
      prevTotal: sum(prevPoints, (p) => p.participants),
      format: nf,
      delta: "pct",
      tone: "up",
    },
    {
      id: "winTime",
      label: "Temps d'une victoire",
      help: "Durée moyenne des parties gagnées. Une baisse peut vouloir dire que les grilles sont plus faciles, ou les joueurs plus forts.",
      at: (p) => (p.winSeconds > 0 ? p.winSeconds : null),
      total: cur.avgSeconds,
      prevTotal: prev.avgSeconds,
      format: fmtSeconds,
      axis: fmtSecondsAxis,
      delta: "pct",
      tone: "neutral",
      integer: false,
    },
  ]

  const metric = metrics.find((m) => m.id === metricId) ?? metrics[0]
  const labels = points.map((p) => p.label)
  const titles = points.map((p) => p.title)

  const series: LineSeries[] = [
    { id: "cur", label: "Cette période", color: "var(--primary)", values: points.map((p) => metric.at(p)), area: true },
  ]
  if (compare) {
    series.push({
      id: "prev",
      label: "Période précédente",
      color: "var(--muted-foreground)",
      dashed: true,
      values: points.map((_, i) => (prevPoints[i] ? metric.at(prevPoints[i]) : null)),
      titles: points.map((_, i) => prevPoints[i]?.title ?? "Période précédente"),
    })
  }

  const totalLabel = metric.total === null ? "—" : metric.format(metric.total)
  const d = deltaOf(metric)
  const nothing = points.every((p) => metric.at(p) === null || metric.at(p) === 0)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div role="tablist" aria-label="Mesure affichée" className="grid grid-cols-2 border-b border-border sm:grid-cols-4">
        {metrics.map((m) => {
          const selected = m.id === metric.id
          const dd = deltaOf(m)
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setMetricId(m.id)}
              className={`relative border-b border-r border-border px-4 py-3.5 text-left transition-colors last:border-r-0 [&:nth-child(2n)]:border-r-0 sm:[&:nth-child(2n)]:border-r sm:[&:nth-child(4n)]:border-r-0 ${
                selected ? "bg-background/70" : "hover:bg-muted/40"
              }`}
            >
              <span className={`absolute inset-x-0 bottom-0 h-[3px] ${selected ? "bg-primary" : "bg-transparent"}`} />
              <span className="block truncate text-xs font-medium text-muted-foreground">{m.label}</span>
              <span className="mt-1 block text-xl font-bold tabular-nums leading-tight sm:text-2xl">{m.total === null ? "—" : m.format(m.total)}</span>
              <span
                className={`mt-0.5 block text-xs font-medium ${dd?.tone === "good" ? "text-primary" : dd?.tone === "bad" ? "text-destructive" : "text-muted-foreground"}`}
              >
                {dd ? dd.text : "—"}
              </span>
            </button>
          )
        })}
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold">
              {metric.label} <span className="font-normal text-muted-foreground">· {totalLabel}</span>
              {d && (
                <span className={`ml-2 text-sm font-medium ${d.tone === "good" ? "text-primary" : d.tone === "bad" ? "text-destructive" : "text-muted-foreground"}`}>
                  {d.text} <span className="font-normal text-muted-foreground">vs période précédente</span>
                </span>
              )}
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{metric.help}</p>
          </div>
          <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm text-muted-foreground">
            <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="size-4 accent-[var(--primary)]" />
            Comparer à la période précédente
          </label>
        </div>

        <div className="mt-3">
          {nothing ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Pas encore de données pour cette mesure sur la période.
            </p>
          ) : (
            <LineChart
              labels={labels}
              titles={titles}
              series={series}
              format={metric.axis ?? metric.format}
              tipFormat={metric.format}
              yMax={metric.yMax}
              integer={metric.integer ?? true}
              ariaLabel={`${metric.label} par ${bucket}`}
            />
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Un point par {bucket}. Survole la courbe (ou touche-la sur mobile) pour lire les chiffres exacts.
        </p>
      </div>
    </div>
  )
}
