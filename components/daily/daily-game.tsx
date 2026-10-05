"use client"

import { Flame, Pause, Play, Trophy } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Confetti } from "@/components/sudoku/confetti"
import { GameToolbar } from "@/components/sudoku/game-toolbar"
import { NumberPad } from "@/components/sudoku/number-pad"
import { ShareResult } from "@/components/share-result"
import { PrintableGrid } from "@/components/sudoku/printable-grid"
import { PrintDialog } from "@/components/sudoku/print-dialog"
import { digitFromKeyEvent } from "@/components/sudoku/keyboard"
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

/** « 2026-09-30 » → « 30 septembre » / « September 30 » (sans décalage de fuseau). */
function formatDateKey(dateKey: string, locale: string): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", { day: "numeric", month: "long" })
}

export function DailyGame() {
  const { dateKey, state, conflicts, remaining, actions } = useDailyGame()
  const { t, locale } = useLanguage()
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
    const timeout = setTimeout(() => setFlashIndices(new Set()), 900)
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
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const sel = state.selected
      const digit = digitFromKeyEvent(e)
      if (digit !== null) {
        actions.input(digit, notesMode)
        e.preventDefault()
        return
      }
      if (e.key === "Escape" && sel !== null && state.multi.length > 0) {
        actions.select(sel)
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
      // Navigation circulaire : sortir d'un bord ramène de l'autre côté
      // (comme sur la plupart des grilles de sudoku mobiles).
      if (e.key === "ArrowUp") r = (r + 8) % 9
      else if (e.key === "ArrowDown") r = (r + 1) % 9
      else if (e.key === "ArrowLeft") c = (c + 8) % 9
      else if (e.key === "ArrowRight") c = (c + 1) % 9
      else return
      // Maj + flèche : étend la sélection à la case voisine.
      if (e.shiftKey) actions.extend(r * 9 + c)
      else actions.select(r * 9 + c)
      e.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [actions, notesMode, state.selected, state.multi, isOver])

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
            {state.rating !== undefined && (
              <div>
                <p className="text-xs font-medium text-muted-foreground">{t.game.ratingLabel}</p>
                <p className="text-xl font-semibold tabular-nums">
                  {state.rating}
                  <span className="text-xs font-medium text-muted-foreground">/100</span>
                </p>
              </div>
            )}
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
          onExtend={actions.extend}
          multi={state.multi}
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

                  <ShareResult
                    text={t.share.daily(
                      formatDateKey(dateKey, locale),
                      formatTime(state.seconds),
                      state.mistakes,
                      t.game.mistakeWord(state.mistakes),
                      state.rating,
                    )}
                  />

                  {/* Classement directement dans l'écran de victoire : on vient de
                      terminer, c'est le moment où on veut le voir, pas après avoir
                      dû défiler en dehors de cette carte. */}
                  <div className="mt-2 w-full max-w-xs text-left">
                    <DailyLeaderboard
                      playerPseudo={submitted ?? getPlayerProfile()?.pseudo ?? null}
                      playerId={getPlayerProfile()?.id ?? null}
                      refreshKey={leaderboardKey}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <GameToolbar
          notesMode={notesMode || state.multi.length > 0}
          canUndo={state.history.length > 0}
          disabled={paused || isOver}
          onToggleNotes={() => setNotesMode((v) => !v)}
          onUndo={actions.undo}
          onErase={actions.erase}
          onPrint={() => setPrintDialogOpen(true)}
        />
        <NumberPad remaining={remaining} disabled={paused || isOver} onInput={(n) => actions.input(n, notesMode)} />
      </div>

      {/* Classement sous la grille : utile pour se situer avant de jouer. Une
          fois la grille terminée, il est déjà affiché dans l'écran de victoire
          ci-dessus (pas besoin de le dupliquer, ni de défiler pour le voir). */}
      {!isOver && (
        <div className="lg:col-span-2">
          <DailyLeaderboard
            playerPseudo={getPlayerProfile()?.pseudo ?? null}
            playerId={getPlayerProfile()?.id ?? null}
            refreshKey={leaderboardKey}
          />
        </div>
      )}

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
