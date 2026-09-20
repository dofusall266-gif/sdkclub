"use client"

import { Pause, Play, Sparkles, Trophy } from "lucide-react"
import { useCallback, useEffect, useState } from "react"

import { GameToolbar } from "@/components/sudoku/game-toolbar"
import { NumberPad } from "@/components/sudoku/number-pad"
import { PrintableGrid } from "@/components/sudoku/printable-grid"
import { PrintDialog } from "@/components/sudoku/print-dialog"
import { SudokuBoard } from "@/components/sudoku/sudoku-board"
import { useSudoku } from "@/components/sudoku/use-sudoku"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { type Difficulty, colOf, rowOf } from "@/lib/sudoku"
import { cn } from "@/lib/utils"

const DIFFICULTIES: Difficulty[] = ["facile", "moyen", "difficile", "expert"]

function formatTime(total: number): string {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

export function SudokuGame({ initialDifficulty = "facile" }: { initialDifficulty?: Difficulty }) {
  const { state, conflicts, remaining, actions } = useSudoku(initialDifficulty)
  const { t } = useLanguage()
  const [notesMode, setNotesMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)
  const [printIncludeSolution, setPrintIncludeSolution] = useState<boolean | null>(null)
  const isOver = state.status === "won"
  const difficultyLabel = t.game.difficulties[state.difficulty]

  useEffect(() => setMounted(true), [])

  // Si l'URL contient ?niveau=..., on lance directement cette difficulté.
  // Fait côté client (pas côté serveur) pour que la page d'accueil reste
  // statique et se charge instantanément depuis le réseau Vercel.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("niveau") as Difficulty | null
    if (requested && DIFFICULTIES.includes(requested)) {
      actions.newGame(requested)
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
      if (sel === null) {
        if (e.key.startsWith("Arrow")) {
          actions.select(40)
          e.preventDefault()
        }
        return
      }
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

  // Erreurs + temps + pause. Affiché au-dessus du plateau sur mobile/tablette,
  // dans le panneau de droite sur ordinateur (comme sudoku.com).
  const stats = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-8 lg:gap-10">
        <div>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">{t.game.errors}</p>
          <p className="text-xl font-semibold tabular-nums lg:text-2xl">{state.mistakes}</p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">{t.game.time}</p>
          <p className="text-xl font-semibold tabular-nums lg:text-2xl">{formatTime(state.seconds)}</p>
        </div>
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
        />

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

        {isOver && (
          <div className="absolute inset-0 grid place-items-center rounded-xl bg-background/90 backdrop-blur-sm">
            <div className="text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/15">
                <Trophy className="size-7 text-primary" />
              </div>
              <p className="mt-3 text-lg font-bold">{t.game.wonTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {difficultyLabel} · {formatTime(state.seconds)} · {state.mistakes} {t.game.mistakeWord(state.mistakes)}
              </p>
              <Button className="mt-4" onClick={() => handleNewGame(state.difficulty)}>
                <Sparkles className="size-4" /> {t.game.newGame}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Panneau de droite : stats (desktop), outils, pavé 3×3, nouvelle partie */}
      <div className="flex flex-col gap-5 lg:col-start-2 lg:row-start-2 lg:gap-6">
        <div className="hidden lg:block">{stats}</div>

        <GameToolbar
          notesMode={notesMode}
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

      <PrintDialog
        open={printDialogOpen}
        onClose={() => setPrintDialogOpen(false)}
        onConfirm={handlePrintConfirm}
      />
    </div>
  )
}
