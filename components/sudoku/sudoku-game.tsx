"use client"

import { Pause, Play, Sparkles } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { ComboToast } from "@/components/sudoku/combo-toast"
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
import { pickComboMessage } from "@/lib/combo-messages"
import { useLanguage } from "@/lib/i18n/context"
import { getLocalTotals, recordPoints } from "@/lib/points-store"
import { type Period, type ScoreBreakdown, comboMultiplier, finalScore, tierReachedAt } from "@/lib/scoring"
import { DIFFICULTIES, type Difficulty, colOf, groupIndices, rowOf } from "@/lib/sudoku"
import { getBestTime, maybeRecordBest, recordWinForStreak } from "@/lib/streak"
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
    streak: number
    breakdown: ScoreBreakdown
    gameId: string
    totals: Record<Period, number>
    seconds: number
    mistakes: number
    difficulty: Difficulty
  } | null>(null)
  const [winPhase, setWinPhase] = useState<"wave" | "card" | null>(null)
  const [bursts, setBursts] = useState(0)
  const [popCell, setPopCell] = useState<{ index: number; id: number } | null>(null)
  const [shakeCell, setShakeCell] = useState<{ index: number; id: number } | null>(null)
  const [gainFloat, setGainFloat] = useState<{ index: number; text: string; id: number } | null>(null)
  const [waveDelays, setWaveDelays] = useState<Map<number, number>>(new Map())
  const [toast, setToast] = useState<{ id: number; text: string; sub: string } | null>(null)
  const [halfwayId, setHalfwayId] = useState<number | null>(null)
  const effectId = useRef(0)
  const isOver = state.status === "won"
  const difficultyLabel = t.game.difficulties[state.difficulty]

  useEffect(() => setMounted(true), [])

  // Effets « récompense » à chaque chiffre posé : « pop » + points flottants si c'est juste,
  // secousse si c'est faux, vague sur la ligne / colonne / bloc qui vient d'être complété.
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

    // Une seule case a changé et elle contient maintenant un chiffre : c'est une saisie.
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

  // Mi-parcours : une fois par grille, quand la moitié des cases à trouver sont justes
  // (jamais rejoué à la reprise d'une partie déjà avancée).
  const halfRef = useRef<{ given: typeof state.given; shown: boolean } | null>(null)
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

  // À la victoire (une seule fois) : record personnel, série de jours, points, puis séquence de fin :
  // vague sur toute la grille + confettis (~2,3 s), puis le tableau récapitulatif.
  const winHandledRef = useRef(false)
  const winTimers = useRef<ReturnType<typeof setTimeout>[]>([])
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
      const gameId = state.gameId ?? `legacy-${Date.now()}-${Math.random().toString(36).slice(2)}`
      recordPoints(gameId, breakdown.total)
      setWinResult({
        isRecord,
        streak: count,
        breakdown,
        gameId,
        totals: getLocalTotals(),
        seconds: state.seconds,
        mistakes: state.mistakes,
        difficulty: state.difficulty,
      })

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
    }
    if (state.status === "playing" && winHandledRef.current) {
      winHandledRef.current = false
      winTimers.current.forEach(clearTimeout)
      winTimers.current = []
      setWinResult(null)
      setWinPhase(null)
      setBursts(0)
      setWaveDelays(new Map())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status])
  useEffect(() => () => winTimers.current.forEach(clearTimeout), [])

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

  const bestTime = mounted ? getBestTime(state.difficulty) : null

  // Erreurs + temps + pause. Affiché au-dessus du plateau sur mobile/tablette,
  // dans le panneau de droite sur ordinateur (comme sudoku.com).
  const stats = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-5 sm:gap-8 lg:gap-10">
        <div>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">Points</p>
          <p className="text-xl font-semibold tabular-nums lg:text-2xl">
            {(state.points ?? 0).toLocaleString(locale === "fr" ? "fr-FR" : "en-US")}
          </p>
          {/* Le combo apparaît sous les points quand il est actif (3 bonnes réponses d'affilée), puis disparaît. */}
          <p
            className={cn(
              "h-4 text-xs font-bold whitespace-nowrap text-flash transition-all duration-300",
              (state.comboStreak ?? 0) >= 3 ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
            )}
          >
            🔥 Combo ×
            {comboMultiplier(state.comboStreak ?? 0, state.multipliers).toLocaleString(locale === "fr" ? "fr-FR" : "en-US", {
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">{t.game.errors}</p>
          <p className="text-xl font-semibold tabular-nums lg:text-2xl">{state.mistakes}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">{t.game.time}</p>
          <p className="text-xl font-semibold tabular-nums lg:text-2xl">{formatTime(state.seconds)}</p>
        </div>
        {state.rating !== undefined && (
          <div>
            <p className="text-xs font-medium text-muted-foreground lg:text-sm">{t.game.ratingLabel}</p>
            <p className="text-xl font-semibold tabular-nums lg:text-2xl">
              {state.rating}
              <span className="text-xs font-medium text-muted-foreground lg:text-sm">/100</span>
            </p>
          </div>
        )}
        {bestTime !== null && (
          <div className="hidden sm:block">
            <p className="text-xs font-medium text-muted-foreground lg:text-sm">{t.game.bestTime}</p>
            <p className="text-xl font-semibold tabular-nums text-primary lg:text-2xl">{formatTime(bestTime)}</p>
          </div>
        )}
      </div>
      <button
        type="button"
        aria-label={state.running ? t.game.pause : t.game.resume}
        title={state.running ? t.game.pause : t.game.resume}
        onClick={actions.togglePause}
        disabled={isOver}
        className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
      >
        {state.running ? <Pause className="size-4" /> : <Play className="size-4" />}
      </button>
    </div>
  )

  return (
    <div className="mx-auto grid max-w-[36rem] gap-4 lg:max-w-none lg:grid-cols-[min(36rem,calc(100dvh-11rem))_18rem] lg:grid-rows-[auto_1fr] lg:justify-center lg:gap-x-6">
      {/* Choix de la difficulté (au-dessus du plateau) */}
      <nav
        aria-label={t.game.difficultyLabel}
        className="flex items-center gap-x-1 overflow-x-auto whitespace-nowrap lg:col-start-1 lg:row-start-1"
      >
        <span className="mr-1 hidden text-sm font-medium text-muted-foreground sm:inline">{t.game.difficultyLabel}</span>
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => handleNewGame(d)}
            aria-current={state.difficulty === d ? "true" : undefined}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors sm:text-base",
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
          waveDelays={waveDelays}
          popCell={popCell}
          shakeCell={shakeCell}
          gainFloat={gainFloat}
        />

        <HalfwayAnimation id={halfwayId} label={locale === "fr" ? "À mi-parcours" : "Halfway there"} />

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

      <ComboToast toast={toast} />
      {Array.from({ length: bursts }, (_, i) => (
        <ConfettiBurst key={i} count={i === 0 ? 40 : 30} />
      ))}
      {winPhase === "card" && winResult && (
        <WinCard
          difficultyLabel={t.game.difficulties[winResult.difficulty]}
          difficulty={winResult.difficulty}
          gameId={winResult.gameId}
          seconds={winResult.seconds}
          mistakes={winResult.mistakes}
          breakdown={winResult.breakdown}
          localTotals={winResult.totals}
          isRecord={winResult.isRecord}
          streak={winResult.streak}
          shareText={t.share.free(
            t.game.difficulties[winResult.difficulty],
            formatTime(winResult.seconds),
            winResult.mistakes,
            t.game.mistakeWord(winResult.mistakes),
            state.rating,
          )}
          showDailyCta={!hasCompletedDailyToday()}
          onNewGame={() => handleNewGame(state.difficulty)}
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
