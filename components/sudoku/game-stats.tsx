"use client"

import { Pause, Play } from "lucide-react"

import { BestScoreStat, ScoreStat, StreakStat } from "@/components/sudoku/score-stat"

/**
 * Bandeau d'infos (comme sudoku.com) :
 *  - en haut : le score (et le combo dessous) à gauche, la flamme de la série à droite ;
 *  - en dessous : meilleur score, erreurs, temps, puis le bouton pause à côté du temps.
 */
export function GameStats(props: {
  points: number
  comboStreak: number
  multipliers?: number[]
  mistakes: number
  timeText: string
  running: boolean
  pauseDisabled: boolean
  onTogglePause: () => void
  labels: { errors: string; time: string; pause: string; resume: string }
  locale: "fr" | "en"
}) {
  const { labels } = props
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex h-9 items-center justify-between gap-4">
        <ScoreStat points={props.points} comboStreak={props.comboStreak} multipliers={props.multipliers} locale={props.locale} />
        <StreakStat locale={props.locale} />
      </div>
      <div className="flex items-center gap-5 sm:gap-8">
        <BestScoreStat locale={props.locale} />
        <div>
          <p className="text-xs font-medium text-muted-foreground lg:text-sm">{labels.errors}</p>
          <p className="text-xl font-semibold tabular-nums lg:text-2xl">{props.mistakes}</p>
        </div>
        <div className="flex items-center gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground lg:text-sm">{labels.time}</p>
            <p className="text-xl font-semibold tabular-nums lg:text-2xl">{props.timeText}</p>
          </div>
          <button
            type="button"
            aria-label={props.running ? labels.pause : labels.resume}
            title={props.running ? labels.pause : labels.resume}
            onClick={props.onTogglePause}
            disabled={props.pauseDisabled}
            className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40"
          >
            {props.running ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
