"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import type { State } from "@/components/sudoku/use-sudoku"
import { pickComboMessage } from "@/lib/combo-messages"
import type { Locale } from "@/lib/i18n/dictionaries"
import { comboMultiplier, tierReachedAt } from "@/lib/scoring"
import { colOf, groupIndices, rowOf } from "@/lib/sudoku"

/**
 * Animations de récompense partagées par la partie libre et le défi du jour :
 * « pop » + points flottants à chaque bon chiffre, secousse sur une erreur, vague sur la ligne / colonne / bloc complété,
 * messages de combo (3, 7, 10, 20), animation de mi-parcours, et séquence de fin (vague sur toute la grille + confettis).
 */
export function useGameEffects(state: State, locale: Locale) {
  const [popCell, setPopCell] = useState<{ index: number; id: number } | null>(null)
  const [shakeCell, setShakeCell] = useState<{ index: number; id: number } | null>(null)
  const [gainFloat, setGainFloat] = useState<{ index: number; text: string; id: number } | null>(null)
  const [waveDelays, setWaveDelays] = useState<Map<number, number>>(new Map())
  const [toast, setToast] = useState<{ id: number; text: string; sub: string } | null>(null)
  const [halfwayId, setHalfwayId] = useState<number | null>(null)
  const [winPhase, setWinPhase] = useState<"wave" | "card" | null>(null)
  const [bursts, setBursts] = useState(0)
  const effectId = useRef(0)
  const winTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Chiffre posé : pop + points flottants si juste, secousse si faux, vague sur la zone complétée.
  const prevGridRef = useRef(state.grid)
  const prevGivenRef = useRef(state.given)
  const prevPointsRef = useRef(state.points ?? 0)
  const prevHistoryRef = useRef(state.history.length)
  useEffect(() => {
    const prev = prevGridRef.current
    const grid = state.grid
    const gained = (state.points ?? 0) - prevPointsRef.current
    const newGrid = prevGivenRef.current !== state.given
    const undone = state.history.length < prevHistoryRef.current
    prevGridRef.current = grid
    prevGivenRef.current = state.given
    prevPointsRef.current = state.points ?? 0
    prevHistoryRef.current = state.history.length
    if (prev === grid || newGrid || undone) return

    const changedCells: number[] = []
    for (let i = 0; i < 81; i++) if (prev[i] !== grid[i]) changedCells.push(i)
    if (changedCells.length !== 1) return
    const changed = changedCells[0]
    if (grid[changed] === 0 || state.given[changed] !== 0) return

    const id = ++effectId.current
    if (grid[changed] !== state.solution[changed]) {
      setShakeCell({ index: changed, id })
      return
    }
    setPopCell({ index: changed, id })
    if (gained > 0) setGainFloat({ index: changed, text: `+${gained}`, id })

    const { row, col, box } = groupIndices(changed)
    const complete = (indices: number[]) => indices.every((i) => grid[i] === state.solution[i])
    const delays = new Map<number, number>()
    const add = (cells: number[]) =>
      cells.forEach((i, k) => {
        const d = k * 70
        const old = delays.get(i)
        if (old === undefined || old > d) delays.set(i, d)
      })
    if (complete(row)) add(row)
    if (complete(col)) add(col)
    if (complete(box)) add(box)
    if (delays.size === 0) return
    setWaveDelays(delays)
    const timer = setTimeout(() => setWaveDelays(new Map()), 70 * 9 + 1000)
    return () => clearTimeout(timer)
  }, [state.grid, state.given, state.solution, state.points, state.history.length])

  // Messages de combo (3, 7, 10, 20 bonnes réponses d'affilée), tirés au hasard dans une liste.
  const prevStreakRef = useRef(state.comboStreak ?? 0)
  useEffect(() => {
    const streak = state.comboStreak ?? 0
    const before = prevStreakRef.current
    prevStreakRef.current = streak
    if (streak <= before || tierReachedAt(streak) < 0) return
    const mult = comboMultiplier(streak, state.multipliers).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
      maximumFractionDigits: 2,
    })
    setToast({ id: ++effectId.current, text: pickComboMessage(streak, locale), sub: `Combo ×${mult}` })
    const timer = setTimeout(() => setToast(null), 2100)
    return () => clearTimeout(timer)
  }, [state.comboStreak, state.multipliers, locale])

  // Mi-parcours : une fois par grille (jamais rejoué à la reprise d'une partie déjà avancée).
  const halfRef = useRef<{ given: State["given"]; shown: boolean } | null>(null)
  useEffect(() => {
    const empties = state.given.reduce((n, v) => n + (v === 0 ? 1 : 0), 0)
    if (empties === 0) return
    let correct = 0
    for (let i = 0; i < 81; i++) if (state.given[i] === 0 && state.grid[i] === state.solution[i]) correct++
    const reached = correct / empties >= 0.5
    if (!halfRef.current || halfRef.current.given !== state.given) {
      halfRef.current = { given: state.given, shown: reached }
      return
    }
    if (reached && !halfRef.current.shown && state.status === "playing") {
      halfRef.current.shown = true
      setHalfwayId(++effectId.current)
      const timer = setTimeout(() => setHalfwayId(null), 2300)
      return () => clearTimeout(timer)
    }
  }, [state.grid, state.given, state.solution, state.status])

  /** Séquence de fin : vague sur toute la grille + 3 explosions de confettis (~2,3 s), puis le récapitulatif. `instant` = directement le récapitulatif. */
  const beginWin = useCallback((instant = false) => {
    if (instant) {
      setWinPhase("card")
      return
    }
    const delays = new Map<number, number>()
    for (let i = 0; i < 81; i++) delays.set(i, (rowOf(i) + colOf(i)) * 60)
    setWaveDelays(delays)
    setWinPhase("wave")
    winTimers.current = [0, 700, 1400].map((d) => setTimeout(() => setBursts((n) => n + 1), d))
    winTimers.current.push(
      setTimeout(() => {
        setWaveDelays(new Map())
        setWinPhase("card")
      }, 2300),
    )
  }, [])

  const resetWin = useCallback(() => {
    winTimers.current.forEach(clearTimeout)
    winTimers.current = []
    setWinPhase(null)
    setBursts(0)
    setWaveDelays(new Map())
  }, [])

  useEffect(() => () => winTimers.current.forEach(clearTimeout), [])

  return { popCell, shakeCell, gainFloat, waveDelays, toast, halfwayId, winPhase, bursts, beginWin, resetWin }
}
