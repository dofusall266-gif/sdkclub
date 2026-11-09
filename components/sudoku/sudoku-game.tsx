"use client"

import { Pause, Sparkles } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { ComboToast } from "@/components/sudoku/combo-toast"
import { GameStats } from "@/components/sudoku/game-stats"
import { useGameEffects } from "@/components/sudoku/use-game-effects"
import { ConfettiBurst } from "@/components/sudoku/confetti-burst"
import { GameToolbar } from "@/components/sudoku/game-toolbar"
import { NumberPad } from "@/components/sudoku/number-pad"
import { HalfwayAnimation } from "@/components/sudoku/halfway-animation"
import { PrintableGrid } from "@/components/sudoku/printable-grid"
import { PrintDialog } from "@/components/sudoku/print-dialog"
import { digitFromKeyEvent } from "@/components/sudoku/keyboard"
import { SudokuBoard } from "@/components/sudoku/sudoku-board"
import { useSudoku } from "@/components/sudoku/use-sudoku"
import { WinCard } from "@/components/sudoku/win-card"
import { Button } from "@/components/ui/button"
import { hasCompletedDailyToday } from "@/lib/daily"
import { useLanguage } from "@/lib/i18n/context"
import { getLocalTotals, maybeRecordBestScore, recordPoints } from "@/lib/points-store"
import { type Period, type ScoreBreakdown, finalScore } from "@/lib/scoring"
import { DIFFICULTIES, type Difficulty, colOf, groupIndices, rowOf } from "@/lib/sudoku"
import { maybeRecordBest, recordWinForStreak } from "@/lib/streak"
import { cn } from "@/lib/utils"

function formatTime(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function SudokuGame({
  initialDifficulty = "facile",
  forceDifficulty,
}: {
  initialDifficulty?: Difficulty
  /** Pages par niveau (/sudoku-expert…) : si la partie en cours est d'un autre niveau, on en lance une au niveau de la page. */
  forceDifficulty?: Difficulty
}) {
  const { state, conflicts, remaining, actions } = useSudoku(initialDifficulty)
  const { t, locale } = useLanguage()
  const [notesMode, setNotesMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printIncludeSolution, setPrintIncludeSolution] = useState<boolean | null>(null)
  const [flashIndices, setFlashIndices] = useState<Set<number>>(new Set())
  const [winResult, setWinResult] = useState<{
    isRecord: boolean
    isScoreRecord: boolean
    streak: number
    breakdown: ScoreBreakdown
    gameId: string
    totals: Record<Period, number>
    seconds: number
    mistakes: number
    difficulty: Difficulty
  } | null>(null)
  const fx = useGameEffects(state, locale)
  const [cardOpen, setCardOpen] = useState(true)
  const isOver = state.status === "won"
  const difficultyLabel = t.game.difficulties[state.difficulty]

  useEffect(() => setMounted(true), [])

  // À la victoire (une seule fois) : record personnel, série de jours, points, puis séquence de fin
  // (vague sur toute la grille + confettis, ~2,3 s, puis le tableau récapitulatif).
  const winHandledRef = useRef(false)
  useEffect(() => {
    if (state.status === "won" && !winHandledRef.current) {
      winHandledRef.current = true
      const isRecord = maybeRecordBest(state.difficulty, state.seconds, state.mistakes)
      const { count } = recordWinForStreak()
      window.dispatchEvent(new Event("sc:streak-updated"))

      const breakdown = finalScore({
        difficulty: state.difficulty,
        basePoints: state.basePoints ?? 0,
        points: state.points ?? 0,
        seconds: state.seconds,
        mistakes: state.mistakes,
        emptyCells: state.given.reduce((n, v) => n + (v === 0 ? 1 : 0), 0),
      })
      const isScoreRecord = maybeRecordBestScore(breakdown.total)
      const gameId = state.gameId ?? `legacy-${Date.now()}-${Math.random().toString(36).slice(2)}`
      recordPoints(gameId, breakdown.total)
      setWinResult({
        isRecord,
        isScoreRecord,
        streak: count,
        breakdown,
        gameId,
        totals: getLocalTotals(),
        seconds: state.seconds,
        mistakes: state.mistakes,
        difficulty: state.difficulty,
      })
      setCardOpen(true)
      fx.beginWin()
    }
    if (state.status === "playing" && winHandledRef.current) {
      winHandledRef.current = false
      setWinResult(null)
      fx.resetWin()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])

  // Si l'URL contient ?niveau=..., on lance directement cette difficulté.
  // Fait côté client (pas côté serveur) pour que la page d'accueil reste
  // statique et se charge instantanément depuis le réseau Vercel.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("niveau") as Difficulty | null
    if (requested && DIFFICULTIES.includes(requested)) {
      actions.newGame(requested)
    } else if (forceDifficulty && state.difficulty !== forceDifficulty) {
      actions.newGame(forceDifficulty)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNewGame = useCallback(
    (difficulty: Difficulty) => {
      actions.newGame(difficulty)
      setNotesMode(false)
    },
    [actions],
  )

  const handlePrintClick = useCallback(() => setPrintDialogOpen(true), [])

  const handlePrintConfirm = useCallback((includeSolution: boolean) => {
    setPrintDialogOpen(false)
    setPrintIncludeSolution(includeSolution)
  }, [])

  // Une fois que la page à imprimer (avec ou sans solution) est rendue,
  // on lance l'impression, puis on remet un titre de document propre.
  useEffect(() => {
    if (printIncludeSolution === null) return
    const previousTitle = document.title
    document.title = `Sudoku - ${difficultyLabel}`
    const timeout = setTimeout(() => {
      window.print()
      setPrintIncludeSolution(null)
      document.title = previousTitle
    }, 60)
    return () => clearTimeout(timeout)
  }, [printIncludeSolution, state.difficulty])

  // Raccourcis clavier : flèches, chiffres, effacement.
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
      if (sel === null) {
        if (e.key.startsWith("Arrow")) {
          actions.select(40)
          e.preventDefault()
        }
        return
      }
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

  const paused = !state.running && !isOver

  // Largeur maximale du plateau : limitée aussi par la hauteur de l'écran
  // pour que la grille reste entièrement visible sans défiler.
  const boardMax = "max-w-[min(36rem,calc(100dvh-11rem))]"

  if (!mounted) {
    return (
      <div className="mx-auto grid max-w-[36rem] gap-4 lg:max-w-none lg:grid-cols-[min(36rem,calc(100dvh-11rem))_18rem] lg:justify-center lg:gap-x-6">
        <div className="flex flex-col gap-4">
          <div className="h-8" />
          <div className={cn("aspect-square w-full animate-pulse rounded-xl border-2 border-border bg-muted/40", boardMax)} />
        </div>
        <div className="hidden lg:block" />
      </div>
    )
  }

  // Score + série en haut, puis meilleur score, erreurs, temps et pause. Affiché au-dessus du plateau
  // sur mobile/tablette, dans le panneau de droite sur ordinateur (comme sudoku.com).
  const stats = (
    <GameStats
      points={state.points ?? 0}
      comboStreak={state.comboStreak ?? 0}
      multipliers={state.multipliers}
      mistakes={state.mistakes}
      timeText={formatTime(state.seconds)}
      running={state.running}
      pauseDisabled={isOver}
      onTogglePause={actions.togglePause}
      labels={{ errors: t.game.errors, time: t.game.time, pause: t.game.pause, resume: t.game.resume }}
      locale={locale}
    />
  )

  return (
    <div className="mx-auto grid max-w-[36rem] gap-4 lg:max-w-none lg:grid-cols-[min(36rem,calc(100dvh-11rem))_18rem] lg:grid-rows-[auto_1fr] lg:justify-center lg:gap-x-6">
      {/* Choix de la difficulté (au-dessus du plateau) */}
      <nav
        aria-label={t.game.difficultyLabel}
        className="flex flex-nowrap items-center justify-between gap-0.5 overflow-x-auto [scrollbar-width:none] lg:col-start-1 lg:row-start-1 [&::-webkit-scrollbar]:hidden"
      >
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleNewGame(d)}
            aria-current={state.difficulty === d ? "true" : undefined}
            className={cn(
              "cursor-pointer rounded-lg px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-2.5 sm:text-[0.95rem]",
              "hover:bg-primary/10 hover:text-primary active:bg-primary/20",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              state.difficulty === d ? "font-semibold text-primary" : "text-foreground/70",
            )}
          >
            {t.game.difficulties[d]}
          </button>
        ))}
      </nav>

      {/* Stats (mobile / tablette uniquement) */}
      <div className="lg:hidden">{stats}</div>

      {/* Plateau de jeu */}
      <div className={cn("relative mx-auto w-full lg:col-start-1 lg:row-start-2 lg:mx-0", boardMax)}>
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
          waveDelays={fx.waveDelays}
          popCell={fx.popCell}
          shakeCell={fx.shakeCell}
          gainFloat={fx.gainFloat}
        />

        {isOver && fx.winPhase === "card" && winResult && !cardOpen && (
          <button
            type="button"
            onClick={() => setCardOpen(true)}
            className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
          >
            {locale === "fr" ? "Voir le récapitulatif" : "Show summary"}
          </button>
        )}

        <HalfwayAnimation id={fx.halfwayId} label={locale === "fr" ? "À mi-parcours" : "Halfway there"} />

        {paused && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/85 backdrop-blur-sm">
            <div className="text-center">
              <Pause className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-2 font-semibold">{t.game.paused}</p>
              <Button className="mt-3" size="sm" onClick={actions.togglePause}>
                {t.game.resume}
              </Button>
            </div>
          </div>
        )}

      </div>

      {/* Panneau de droite : stats (desktop), outils, pavé 3×3, nouvelle partie */}
      <div className="flex flex-col gap-5 lg:col-start-2 lg:row-start-2 lg:gap-6">
        <div className="hidden lg:block">{stats}</div>

        <GameToolbar
          notesMode={notesMode || state.multi.length > 0}
          canUndo={state.history.length > 0}
          disabled={paused || isOver}
          onToggleNotes={() => setNotesMode((v) => !v)}
          onUndo={actions.undo}
          onErase={actions.erase}
          onPrint={handlePrintClick}
        />

        <NumberPad remaining={remaining} disabled={paused || isOver} onInput={(n) => actions.input(n, notesMode)} />

        <Button size="lg" className="h-12 text-base" onClick={() => handleNewGame(state.difficulty)}>
          <Sparkles className="size-4" /> {t.game.newGame}
        </Button>

        {/* Astuce clavier : inutile sur mobile, donc affichée seulement sur ordinateur. */}
        <p className="hidden text-center text-xs text-muted-foreground lg:block">{t.game.hintKeyboard}</p>
      </div>

      {/* Zone d'impression (masquée à l'écran, visible uniquement à l'impression) */}
      <div id="print-area" className="hidden print:block">
        <PrintableGrid grid={state.given} title={`Sudoku — ${difficultyLabel}`} />
        {printIncludeSolution && <PrintableGrid grid={state.solution} title={t.game.solutionLabel} />}
      </div>

      <ComboToast toast={fx.toast} />
      {Array.from({ length: fx.bursts }, (_, i) => (
        <ConfettiBurst key={i} count={i === 0 ? 40 : 30} />
      ))}
      {fx.winPhase === "card" && winResult && cardOpen && (
        <WinCard
          difficultyLabel={t.game.difficulties[winResult.difficulty]}
          difficulty={winResult.difficulty}
          gameId={winResult.gameId}
          seconds={winResult.seconds}
          mistakes={winResult.mistakes}
          breakdown={winResult.breakdown}
          localTotals={winResult.totals}
          isRecord={winResult.isRecord}
          isScoreRecord={winResult.isScoreRecord}
          streak={winResult.streak}
          shareText={t.share.free(
            t.game.difficulties[winResult.difficulty],
            formatTime(winResult.seconds),
            winResult.mistakes,
            t.game.mistakeWord(winResult.mistakes),
          )}
          showDailyCta={!hasCompletedDailyToday()}
          onNewGame={() => handleNewGame(state.difficulty)}
          onClose={() => setCardOpen(false)}
        />
      )}

      <PrintDialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        onConfirm={handlePrintConfirm}
      />
    </div>
  )
}
