"use client"

import { useEffect, useMemo, useState } from "react"

import { TrainingBoard } from "@/components/training/training-board"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { TRAINING_CASES } from "@/lib/training-cases"
import { checkSelection, decodeCase, explainPattern, type TrainingPattern, type TrainingTech } from "@/lib/training"

type Status = "playing" | "wrong" | "correct" | "revealed"

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => i)
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Exercice : une vraie situation de grille avec toutes les notes ; le joueur touche les cases du motif. */
export function Trainer({ tech, task }: { tech: TrainingTech; task: string }) {
  const { t, locale } = useLanguage()
  const cases = TRAINING_CASES[tech]
  // L'ordre est mélangé après l'affichage (sinon le rendu serveur et le rendu navigateur diffèrent).
  const [order, setOrder] = useState<number[]>(() => cases.map((_, i) => i))
  useEffect(() => setOrder(shuffled(cases.length)), [cases.length])

  const [pos, setPos] = useState(0)
  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [status, setStatus] = useState<Status>("playing")
  const [message, setMessage] = useState<string>("")
  const [hintLevel, setHintLevel] = useState(0)
  const [shown, setShown] = useState<TrainingPattern | null>(null)
  const [stats, setStats] = useState({ tried: 0, ok: 0 })

  const dc = useMemo(() => decodeCase(cases[order[pos % order.length]]), [cases, order, pos])
  const finished = status === "correct" || status === "revealed"

  // Chiffres du motif (pour l'indice 1) et lignes à teinter (indice 2)
  const digits = useMemo(() => [...new Set(dc.patterns.map((p) => p.d))].sort(), [dc])
  const bivalue = useMemo(() => new Set(dc.candidates.flatMap((c, i) => (c.length === 2 ? [i] : []))), [dc])
  const pivots = useMemo(() => new Set(dc.patterns.flatMap((p) => (p.pv !== undefined ? [p.pv] : []))), [dc])

  const maxHints = 2
  const hintText =
    hintLevel === 0
      ? ""
      : tech === "xy_wing"
        ? hintLevel === 1
          ? t.training.hintBivalue
          : t.training.hintPivot
        : hintLevel === 1
          ? t.training.hintDigit(digits)
          : t.training.hintLines

  const focusDigits = tech !== "xy_wing" && (hintLevel >= 1 || finished) ? digits : []
  const shade = tech !== "xy_wing" && hintLevel >= 2 && !shown ? dc.patterns.flatMap((p) => (p.l ? [p.l] : [])) : []
  const tint = tech === "xy_wing" && !finished ? (hintLevel >= 2 ? pivots : hintLevel === 1 ? bivalue : undefined) : undefined

  const toggle = (i: number) => {
    if (finished) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
    if (status === "wrong") setStatus("playing")
  }

  const verify = () => {
    const res = checkSelection(selected, dc.patterns)
    if (res.matched >= 0) {
      setStatus("correct")
      setShown(dc.patterns[res.matched])
      setMessage(t.training.correct)
      setStats((s) => ({ tried: s.tried + 1, ok: s.ok + (hintLevel === 0 ? 1 : 0) }))
      return
    }
    setStatus("wrong")
    setMessage(
      res.bestOverlap === 0
        ? t.training.wrongNone
        : selected.size !== res.bestSize && res.bestOverlap === selected.size
          ? t.training.wrongSize(res.bestSize)
          : t.training.wrongClose(res.bestOverlap, res.bestSize),
    )
  }

  const showSolution = () => {
    setStatus("revealed")
    setShown(dc.patterns[0])
    setMessage(t.training.revealed)
    setStats((s) => ({ tried: s.tried + 1, ok: s.ok }))
  }

  const next = () => {
    setPos((p) => p + 1)
    setSelected(new Set())
    setStatus("playing")
    setMessage("")
    setHintLevel(0)
    setShown(null)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,34rem)_1fr]">
      <TrainingBoard
        dc={dc}
        selected={selected}
        onToggle={toggle}
        focusDigits={focusDigits}
        reveal={shown}
        shade={shade}
        tint={tint}
      />

      <div className="space-y-4">
        <p className="text-sm font-medium">{task}</p>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {t.training.selected(selected.size)}
          {stats.tried > 0 && <span className="ml-2">· {t.training.score(stats.ok, stats.tried)}</span>}
        </p>

        {!finished && (
          <div className="flex flex-wrap gap-2">
            <Button onClick={verify} disabled={selected.size === 0}>
              {t.training.check}
            </Button>
            <Button variant="outline" onClick={() => setSelected(new Set())} disabled={selected.size === 0}>
              {t.training.clear}
            </Button>
            <Button variant="outline" onClick={() => setHintLevel((h) => Math.min(maxHints, h + 1))} disabled={hintLevel >= maxHints}>
              {t.training.hint} {hintLevel > 0 ? `(${hintLevel}/${maxHints})` : ""}
            </Button>
            <Button variant="ghost" onClick={showSolution}>
              {t.training.reveal}
            </Button>
          </div>
        )}

        {hintText && !finished && <p className="rounded-lg border border-border bg-secondary/40 p-3 text-sm">{hintText}</p>}
        {hintLevel >= maxHints && !finished && status === "wrong" && (
          <p className="text-xs text-muted-foreground">{t.training.noMoreHints}</p>
        )}

        {message && (
          <p
            className={`rounded-lg border p-3 text-sm font-medium ${
              status === "correct" ? "border-primary/40 bg-primary/10 text-primary" : status === "wrong" ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-border bg-secondary/40"
            }`}
            role="status"
          >
            {message}
          </p>
        )}

        {finished && shown && (
          <>
            <p className="text-sm leading-relaxed">{explainPattern(tech, shown, dc, locale)}</p>
            <p className="text-xs text-muted-foreground">{t.training.notation}</p>
            <Button onClick={next}>{t.training.next}</Button>
          </>
        )}
      </div>
    </div>
  )
}
