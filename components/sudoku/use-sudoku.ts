"use client"

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react"

import {
  type Difficulty,
  type Grid,
  findConflicts,
  generatePuzzle,
  isComplete,
} from "@/lib/sudoku"

interface Snapshot {
  grid: Grid
  notes: number[][]
}

interface State {
  difficulty: Difficulty
  given: Grid
  solution: Grid
  grid: Grid
  notes: number[][] // notes[index] = array of pencil marks
  selected: number | null
  history: Snapshot[]
  mistakes: number
  status: "playing" | "won"
  seconds: number
  running: boolean
}

type Action =
  | { type: "new"; difficulty: Difficulty }
  | { type: "select"; index: number }
  | { type: "input"; value: number; notesMode: boolean }
  | { type: "erase" }
  | { type: "hint" }
  | { type: "undo" }
  | { type: "tick" }
  | { type: "toggleRunning"; running?: boolean }

function emptyNotes(): number[][] {
  return Array.from({ length: 81 }, () => [])
}

function createGame(difficulty: Difficulty): State {
  const { puzzle, solution } = generatePuzzle(difficulty)
  return {
    difficulty,
    given: puzzle,
    solution,
    grid: [...puzzle],
    notes: emptyNotes(),
    selected: null,
    history: [],
    mistakes: 0,
    status: "playing",
    seconds: 0,
    running: true,
  }
}

function snapshot(state: State): Snapshot {
  return { grid: [...state.grid], notes: state.notes.map((n) => [...n]) }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "new":
      return createGame(action.difficulty)

    case "select":
      return { ...state, selected: action.index }

    case "tick":
      return state.running && state.status === "playing"
        ? { ...state, seconds: state.seconds + 1 }
        : state

    case "toggleRunning":
      return { ...state, running: action.running ?? !state.running }

    case "input": {
      const i = state.selected
      if (i === null || state.given[i] !== 0 || state.status !== "playing") return state

      // Mode notes : on ajoute / retire une annotation.
      if (action.notesMode) {
        if (state.grid[i] !== 0) return state
        const history = [...state.history, snapshot(state)]
        const notes = state.notes.map((n) => [...n])
        const set = new Set(notes[i])
        set.has(action.value) ? set.delete(action.value) : set.add(action.value)
        notes[i] = [...set].sort((a, b) => a - b)
        return { ...state, notes, history }
      }

      // Mode normal : on place un chiffre.
      const history = [...state.history, snapshot(state)]
      const grid = [...state.grid]
      const notes = state.notes.map((n) => [...n])

      if (grid[i] === action.value) {
        grid[i] = 0
        return { ...state, grid, history }
      }

      grid[i] = action.value
      notes[i] = []

      const wrong = state.solution[i] !== action.value
      const mistakes = wrong ? state.mistakes + 1 : state.mistakes
      const won = !wrong && isComplete(grid) && grid.every((v, k) => v === state.solution[k])

      return {
        ...state,
        grid,
        notes,
        history,
        mistakes,
        status: won ? "won" : "playing",
        running: won ? false : state.running,
      }
    }

    case "erase": {
      const i = state.selected
      if (i === null || state.given[i] !== 0 || state.status !== "playing") return state
      if (state.grid[i] === 0 && state.notes[i].length === 0) return state
      const history = [...state.history, snapshot(state)]
      const grid = [...state.grid]
      const notes = state.notes.map((n) => [...n])
      grid[i] = 0
      notes[i] = []
      return { ...state, grid, notes, history }
    }

    case "hint": {
      const i = state.selected
      if (i === null || state.given[i] !== 0 || state.status !== "playing") return state
      if (state.grid[i] === state.solution[i]) return state
      const history = [...state.history, snapshot(state)]
      const grid = [...state.grid]
      const notes = state.notes.map((n) => [...n])
      grid[i] = state.solution[i]
      notes[i] = []
      const won = isComplete(grid) && grid.every((v, k) => v === state.solution[k])
      return { ...state, grid, notes, history, status: won ? "won" : "playing", running: won ? false : state.running }
    }

    case "undo": {
      if (state.history.length === 0) return state
      const history = [...state.history]
      const prev = history.pop()!
      return { ...state, grid: prev.grid, notes: prev.notes, history, status: "playing" }
    }

    default:
      return state
  }
}

function track(type: "game_started" | "game_won", difficulty: Difficulty) {
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, difficulty }),
  }).catch(() => {})
}

export function useSudoku(initialDifficulty: Difficulty = "facile") {
  const [state, dispatch] = useReducer(reducer, initialDifficulty, createGame)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wonTrackedRef = useRef(false)

  useEffect(() => {
    intervalRef.current = setInterval(() => dispatch({ type: "tick" }), 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  // Grille initiale au chargement du composant.
  useEffect(() => {
    track("game_started", initialDifficulty)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Victoire (une seule fois par partie).
  useEffect(() => {
    if (state.status === "won" && !wonTrackedRef.current) {
      wonTrackedRef.current = true
      track("game_won", state.difficulty)
    }
    if (state.status === "playing") wonTrackedRef.current = false
  }, [state.status, state.difficulty])

  // Met le minuteur en pause lorsque l'onglet n'est plus visible.
  useEffect(() => {
    const onVisibility = () => {
      dispatch({ type: "toggleRunning", running: !document.hidden })
    }
    document.addEventListener("visibilitychange", onVisibility)
    return () => document.removeEventListener("visibilitychange", onVisibility)
  }, [])

  const conflicts = useMemo(() => findConflicts(state.grid), [state.grid])

  const remaining = useMemo(() => {
    const counts = new Array(10).fill(0)
    for (const v of state.grid) if (v > 0) counts[v]++
    return counts // counts[n] = combien de n placés
  }, [state.grid])

  const newGame = useCallback((difficulty: Difficulty) => {
    dispatch({ type: "new", difficulty })
    track("game_started", difficulty)
  }, [])
  const select = useCallback((index: number) => dispatch({ type: "select", index }), [])
  const input = useCallback((value: number, notesMode: boolean) => dispatch({ type: "input", value, notesMode }), [])
  const erase = useCallback(() => dispatch({ type: "erase" }), [])
  const hint = useCallback(() => dispatch({ type: "hint" }), [])
  const undo = useCallback(() => dispatch({ type: "undo" }), [])
  const togglePause = useCallback(() => dispatch({ type: "toggleRunning" }), [])

  return {
    state,
    conflicts,
    remaining,
    actions: { newGame, select, input, erase, hint, undo, togglePause },
  }
}
