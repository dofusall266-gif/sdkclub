"use client"

import { Flame, Trophy } from "lucide-react"
import { useEffect, useState } from "react"

import { getBestScore } from "@/lib/points-store"
import { comboMultiplier } from "@/lib/scoring"
import { getStreak } from "@/lib/streak"
import { cn } from "@/lib/utils"

const fmtNumber = (n: number, locale: "fr" | "en", max = 0) =>
  n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: max })

/** Score en cours (gros chiffre) ; le combo s'affiche dessous quand il est actif (3 bonnes réponses d'affilée), puis disparaît. */
export function ScoreStat({
  points,
  comboStreak,
  multipliers,
  locale,
}: {
  points: number
  comboStreak: number
  multipliers?: number[]
  locale: "fr" | "en"
}) {
  const comboActive = comboStreak >= 3
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground lg:text-sm">Score</p>
      <p className="text-3xl leading-none font-bold tabular-nums lg:text-4xl">{fmtNumber(points, locale)}</p>
      <p
        className={cn(
          "mt-1 h-4 text-xs font-bold whitespace-nowrap text-flash transition-all duration-300",
          comboActive ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        )}
      >
        🔥 Combo ×{fmtNumber(comboMultiplier(comboStreak, multipliers), locale, 2)}
      </p>
    </div>
  )
}

/** Meilleur score obtenu sur une seule partie (de tous les temps, sur cet appareil). */
export function BestScoreStat({ locale }: { locale: "fr" | "en" }) {
  const [best, setBest] = useState(0)
  useEffect(() => {
    setBest(getBestScore())
    const update = () => setBest(getBestScore())
    window.addEventListener("sc:score-updated", update)
    return () => window.removeEventListener("sc:score-updated", update)
  }, [])
  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground lg:text-sm">{locale === "fr" ? "Meilleur" : "All time"}</p>
      <p className="flex items-center gap-1.5 text-xl font-semibold tabular-nums lg:text-2xl">
        <Trophy className="size-4 text-muted-foreground lg:size-5" />
        {fmtNumber(best, locale)}
      </p>
    </div>
  )
}

/** Flamme de la série de jours consécutifs, à droite du score. */
export function StreakStat({ locale }: { locale: "fr" | "en" }) {
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    setStreak(getStreak())
    const update = () => setStreak(getStreak())
    window.addEventListener("sc:streak-updated", update)
    return () => window.removeEventListener("sc:streak-updated", update)
  }, [])
  return (
    <div
      title={
        locale === "fr"
          ? `Série en cours : ${streak} jour${streak > 1 ? "s" : ""}`
          : `Current streak: ${streak} day${streak === 1 ? "" : "s"}`
      }
      className={cn(
        "flex items-center gap-1 text-3xl leading-none font-bold tabular-nums lg:text-4xl",
        streak > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground/60",
      )}
    >
      <Flame className={cn("size-7 lg:size-8", streak > 0 && "fill-orange-500/25")} />
      {streak}
    </div>
  )
}
