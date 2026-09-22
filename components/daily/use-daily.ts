"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"

import { createGameFromPuzzle, reducer, type State } from "@/components/sudoku/use-sudoku"
import { DAILY_DIFFICULTY, getDailyPuzzle, todayKey } from "@/lib/daily"
import { findConflicts } from "@/lib/sudoku"
import { readJSON, remove, writeJSON } from "@/lib/storage"

function storageKey(dateKey: string) {
  return `sc_daily_game_v1_${dateKey}`
}

function loadPersisted(dateKey: string): State | null {
  const persisted = readJSON<State>(storageKey(dateKey))
  if (!persisted || !Array.isArray(persisted.grid) || persisted.grid.length !== 81) return null
  return { ...persisted, running: false }
}

export function useDailyGame() {
  const dateKey = useMemo(() => todayKey(), [])
  const initialRef = useRef<State | null>(null)
  if (initialRef.current === null) {
    const persisted = loadPersisted(dateKey)
    if (persisted) {
      initialRef.current = persisted
    } else {
      const { puzzle, solution } = getDailyPuzzle(dateKey)
      initialRef.current = createGameFromPuzzle(puzzle, solution, DAILY_DIFFICULTY)
    }
  }

  const [state, dispatch] = useReducer(reducer, initialRef.current)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (state.status === "playing") {
      writeJSON(storageKey(dateKey), state)
    }
    // On garde volontairement l'état "won" en mémoire (pas de remove) : on veut
    // pouvoir réafficher "défi déjà terminé" si la personne revient plus tard.
  }, [state, dateKey])

  useEffect(() => {
    const onVisibility = () => dispatch({ type: "toggleRunning", running: !document.hidden })
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const conflicts = useMemo(() => findConflicts(state.grid), [state.grid])
  const remaining = useMemo(() => {
    const counts = new Array(10).fill(0)
    for (const v of state.grid) if (v > 0) counts[v]++
    return counts
  }, [state.grid])

  const select = useCallback((index: number) => dispatch({ type: "select", index }), [])
  const input = useCallback((value: number, notesMode: boolean) => dispatch({ type: "input", value, notesMode }), [])
  const erase = useCallback(() => dispatch({ type: "erase" }), [])
  const undo = useCallback(() => dispatch({ type: "undo" }), [])
  const togglePause = useCallback(() => dispatch({ type: "toggleRunning" }), [])

  return {
    dateKey,
    state,
    conflicts,
    remaining,
    actions: { select, input, erase, undo, togglePause },
  }
}

/** Efface la sauvegarde locale du défi d'un jour donné (debug / réinitialisation). */
export function clearDailyStorage(dateKey: string) {
  remove(storageKey(dateKey))
}
