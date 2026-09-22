"use client"

import { Flame, Pause, Play, Trophy } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Confetti } from "@/components/sudoku/confetti"
import { GameToolbar } from "@/components/sudoku/game-toolbar"
import { NumberPad } from "@/components/sudoku/number-pad"
import { PrintableGrid } from "@/components/sudoku/printable-grid"
import { PrintDialog } from "@/components/sudoku/print-dialog"
import { SudokuBoard } from "@/components/sudoku/sudoku-board"
import { useDailyGame } from "@/components/daily/use-daily"
import { DailyLeaderboard } from "@/components/daily/daily-leaderboard"
import { DailySubmitForm } from "@/components/daily/daily-submit-form"
import { hasSubmittedDaily, markDailySubmitted } from "@/lib/daily"
import { useLanguage } from "@/lib/i18n/context"
import { getPlayerProfile } from "@/lib/player"
import { colOf, groupIndices, rowOf } from "@/lib/sudoku"
import { maybeRecordBest, recordWinForStreak } from "@/lib/streak"
import { cn } from "@/lib/utils"

function formatTime(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function DailyGame() {
  const { dateKey, state, conflicts, remaining, actions } = useDailyGame()
  const { t } = useLanguage()
  const [mounted, setMounted] = useState(false)
  const [notesMode, setNotesMode] = useState(false)
  const [flashIndices, setFlashIndices] = useState<Set<number>>(new Set())
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)
  const [leaderboardKey, setLeaderboardKey] = useState(0)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printIncludeSolution, setPrintIncludeSolution] = useState<boolean | null>(null)
  const isOver = state.status === "won"
  const paused = !state.running && !isOver

  useEffect(() => {
    setMounted(true)
    setAlreadySubmitted(hasSubmittedDaily(dateKey))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const prevGridRef = useRef(state.grid)
  useEffect(() => {
    const prev = prevGridRef.current
    const grid = state.grid
    prevGridRef.current = grid
    if (prev === grid) return
    let changed = -1
    for (let i = 0; i < 81; i++) {
      if (prev[i] !== grid[i] && grid[i] !== 0) {
        changed = i
        break
      }
    }
    if (changed === -1 || grid[changed] !== state.solution[changed]) return
    const { row, col, box } = groupIndices(changed)
    const complete = (indices: number[]) => indices.every((i) => grid[i] === state.solution[i])
    const newlyDone = new Set<number>()
    if (complete(row)) row.forEach((i) => newlyDone.add(i))
    if (complete(col)) col.forEach((i) => newlyDone.add(i))
    if (complete(box)) box.forEach((i) => newlyDone.add(i))
    if (newlyDone.size === 0) return
    setFlashIndices(newlyDone)
    const timeout = setTimeout(() => setFlashIndices(new Set()), 600)
    return () => clearTimeout(timeout)
  }, [state.grid, state.solution])

  const winHandledRef = useRef(false)
  useEffect(() => {
    if (state.status === "won" && !winHandledRef.current) {
      winHandledRef.current = true
      maybeRecordBest("difficile", state.seconds, state.mistakes)
      recordWinForStreak()
      window.dispatchEvent(new Event("sc:streak-updated"))
    }
  }, [state.status, state.seconds, state.mistakes])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isOver) return
      const sel = state.selected
      if (e.key >= "1" && e.key <= "9") {
        actions.input(Number(e.key), notesMode)
        e.preventDefault()
        return
      }
      if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") {
        actions.erase()
        e.preventDefault()
        return
      }
      if (e.key === "n" || e.key === "N") {
        setNotesMode((v) => !v)
        return
      }
      if (sel === null) return
      let r = rowOf(sel)
      let c = colOf(sel)
      if (e.key === "ArrowUp") r = Math.max(0, r - 1)
      else if (e.key === "ArrowDown") r = Math.min(8, r + 1)
      else if (e.key === "ArrowLeft") c = Math.max(0, c - 1)
      else if (e.key === "ArrowRight") c = Math.min(8, c + 1)
      else return
      actions.select(r * 9 + c)
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [actions, notesMode, state.selected, isOver])

  useEffect(() => {
    if (printIncludeSolution === null) return
    const previousTitle = document.title
    document.title = `Sudoku - ${t.daily.title}`
    const timeout = setTimeout(() => {
      window.print()
      setPrintIncludeSolution(null)
      document.title = previousTitle
    }, 60)
    return () => clearTimeout(timeout)
  }, [printIncludeSolution, t.daily.title])

  const boardMax = "max-w-[min(36rem,calc(100dvh-11rem))]"

  if (!mounted) {
    return <div className={cn("mx-auto aspect-square w-full animate-pulse rounded-xl border-2 border-border bg-muted/40", boardMax)} />
  }

  return (
    <div className="mx-auto grid max-w-[36rem] gap-8 lg:max-w-none lg:grid-cols-[min(36rem,calc(100dvh-11rem))_18rem] lg:justify-center lg:gap-x-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t.game.errors}</p>
              <p className="text-xl font-semibold tabular-nums">{state.mistakes}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">{t.game.time}</p>
              <p className="text-xl font-semibold tabular-nums">{formatTime(state.seconds)}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label={state.running ? t.game.pause : t.game.resume}
            onClick={actions.togglePause}
            disabled={isOver}
            className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 disabled:pointer-events-none disabled:opacity-40"
          >
            {state.running ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        </div>

        <div className={cn("relative mx-auto w-full", boardMax)}>
          <SudokuBoard
            grid={state.grid}
            given={state.given}
            notes={state.notes}
            solution={state.solution}
            selected={state.selected}
            conflicts={conflicts}
            disabled={paused || isOver}
            onSelect={actions.select}
            flashIndices={flashIndices}
          />

          {paused && (
            <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/85 backdrop-blur-sm">
              <div className="text-center">
                <Pause className="mx-auto size-8 text-muted-foreground" />
                <p className="mt-2 font-semibold">{t.game.paused}</p>
                <button
                  type="button"
                  onClick={actions.togglePause}
                  className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  {t.game.resume}
                </button>
              </div>
            </div>
          )}

          {isOver && (
            <div className="absolute inset-0 overflow-y-auto rounded-xl bg-background/95 backdrop-blur-sm">
              <div className="relative min-h-full">
                <Confetti />
                <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
                  <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/15">
                    <Trophy className="size-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{t.game.wonTitle}</p>
                    <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground">
                      <Flame className="size-4 text-orange-500" /> {formatTime(state.seconds)} · {state.mistakes}{" "}
                      {t.game.mistakeWord(state.mistakes)}
                    </p>
                  </div>

                  {!submitted && !alreadySubmitted ? (
                    <div className="w-full max-w-xs text-left">
                      <DailySubmitForm
                        variant="inline"
                        seconds={state.seconds}
                        mistakes={state.mistakes}
                        dateKey={dateKey}
                        onSubmitted={(pseudo) => {
                          setSubmitted(pseudo)
                          markDailySubmitted(dateKey)
                          setLeaderboardKey((k) => k + 1)
                        }}
                      />
                    </div>
                  ) : (
                    <p className="rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary">
                      {submitted ? t.daily.submitted : t.daily.alreadyPlayed}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <GameToolbar
          notesMode={notesMode}
          canUndo={state.history.length > 0}
          disabled={paused || isOver}
          onToggleNotes={() => setNotesMode((v) => !v)}
          onUndo={actions.undo}
          onErase={actions.erase}
          onPrint={() => setPrintDialogOpen(true)}
        />
        <NumberPad remaining={remaining} disabled={paused || isOver} onInput={(n) => actions.input(n, notesMode)} />
      </div>

      {/* Classement, toujours visible sous la grille (le formulaire de score, lui,
          est directement dans l'écran de victoire ci-dessus, pour rester visible
          sans avoir à défiler une fois la grille terminée). */}
      <div className="lg:col-span-2">
        <DailyLeaderboard
          playerPseudo={submitted ?? getPlayerProfile()?.pseudo ?? null}
          playerId={getPlayerProfile()?.id ?? null}
          refreshKey={leaderboardKey}
        />
      </div>

      <div id="print-area" className="hidden print:block">
        <PrintableGrid grid={state.given} title={`Sudoku — ${t.daily.title}`} />
        {/* Volontairement pas de solution imprimable ici : ce serait un moyen
            trivial de tricher sur un classement partagé entre tous les joueurs. */}
      </div>

      <PrintDialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        allowSolution={false}
        onConfirm={(includeSolution) => {
          setPrintDialogOpen(false)
          setPrintIncludeSolution(includeSolution)
        }}
      />
    </div>
  )
}
