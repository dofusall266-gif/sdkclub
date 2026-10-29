import type { ReactNode } from "react"

import { completion } from "@/lib/admin-stats"

export function formatSeconds(total: number | null): string {
  if (total === null) return "—"
  const m = Math.floor(total / 60)
  const s = Math.round(total % 60)
  return `${m}m ${String(s).padStart(2, "0")}s`
}

/** Bloc titré : un titre, une phrase qui dit À QUOI SERT la section, puis le contenu. */
export function Section({ title, hint, children }: { title: string; hint: string; children: ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
      <div className="mt-4">{children}</div>
    </section>
  )
}

/** Variation par rapport à la période précédente. `good` dit si une hausse est une bonne nouvelle. */
export function Delta({
  cur,
  prev,
  unit = "",
  good = "up",
}: {
  cur: number | null
  prev: number | null
  unit?: string
  good?: "up" | "down"
}) {
  if (cur === null || prev === null || (prev === 0 && cur === 0)) return <span className="text-xs text-muted-foreground">—</span>
  const diff = unit === "pts" ? cur - prev : prev === 0 ? null : Math.round(((cur - prev) / prev) * 100)
  if (diff === null) return <span className="text-xs text-muted-foreground">nouveau</span>
  if (diff === 0) return <span className="text-xs text-muted-foreground">stable</span>
  const better = good === "up" ? diff > 0 : diff < 0
  return (
    <span className={`text-xs font-medium ${better ? "text-primary" : "text-destructive"}`}>
      {diff > 0 ? "▲" : "▼"} {Math.abs(diff)}
      {unit === "pts" ? " pts" : " %"}
    </span>
  )
}

export function KpiCard({
  label,
  value,
  help,
  delta,
}: {
  label: string
  value: ReactNode
  help: string
  delta?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-1.5 flex items-baseline justify-between gap-2">
        <p className="text-2xl font-bold tabular-nums">{value}</p>
        {delta}
      </div>
      <p className="mt-1 text-xs leading-snug text-muted-foreground">{help}</p>
    </div>
  )
}

/** Barre de taux de réussite (parties gagnées ÷ lancées), avec les chiffres bruts à côté. */
export function RateRow({
  label,
  started,
  won,
  extra,
}: {
  label: string
  started: number
  won: number
  extra?: string
}) {
  const rate = completion(started, won)
  return (
    <div className="grid grid-cols-[7rem_1fr_auto] items-center gap-3 text-sm">
      <span className="truncate capitalize text-muted-foreground">{label}</span>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${rate ?? 0}%` }} />
      </div>
      <span className="whitespace-nowrap text-right tabular-nums">
        <span className="font-semibold">{rate === null ? "—" : `${rate} %`}</span>
        <span className="text-xs text-muted-foreground">
          {" "}
          · {won}/{started}
          {extra ? ` · ${extra}` : ""}
        </span>
      </span>
    </div>
  )
}

export function Empty({ children = "Pas encore assez de données." }: { children?: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}
