"use client"

import { Flame } from "lucide-react"
import { useEffect, useState } from "react"

import { getBestScore } from "@/lib/points-store"
import { comboMultiplier } from "@/lib/scoring"
import { getStreak } from "@/lib/streak"
import { cn } from "@/lib/utils"

/** Score en cours (juste le chiffre), avec dessous : le combo quand il est actif, sinon le meilleur score de tous les temps. */
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
  const [best, setBest] = useState(0)
  useEffect(() => {
    setBest(getBestScore())
    const update = () => setBest(getBestScore())
    window.addEventListener("sc:score-updated", update)
    return () => window.removeEventListener("sc:score-updated", update)
  }, [])

  const fmt = (n: number, max = 0) => n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US", { maximumFractionDigits: max })
  const comboActive = comboStreak >= 3

  return (
    <div>
      <p className="text-xs font-medium text-muted-foreground lg:text-sm">Score</p>
      <p className="text-xl font-semibold tabular-nums lg:text-2xl">{fmt(points)}</p>
      <p className="h-4 text-xs whitespace-nowrap">
        {comboActive ? (
          <span className="font-bold text-flash">🔥 Combo ×{fmt(comboMultiplier(comboStreak, multipliers), 2)}</span>
        ) : best > 0 ? (
          <span className="text-muted-foreground">
            {locale === "fr" ? "Meilleur" : "Best"} : {fmt(best)}
          </span>
        ) : null}
      </p>
    </div>
  )
}

/** Flamme de la série de jours consécutifs (remplace l'ancienne « difficulté sur 100 »). */
export function StreakStat({ locale }: { locale: "fr" | "en" }) {
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    setStreak(getStreak())
    const update = () => setStreak(getStreak())
    window.addEventListener("sc:streak-updated", update)
    return () => window.removeEventListener("sc:streak-updated", update)
  }, [])
  return (
    <div title={locale === "fr" ? `Série en cours : ${streak} jour${streak > 1 ? "s" : ""}` : `Current streak: ${streak} day${streak === 1 ? "" : "s"}`}>
      <p className="text-xs font-medium text-muted-foreground lg:text-sm">{locale === "fr" ? "Série" : "Streak"}</p>
      <p
        className={cn(
          "flex items-center gap-1 text-xl font-semibold tabular-nums lg:text-2xl",
          streak > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground",
        )}
      >
        <Flame className={cn("size-5 lg:size-6", streak > 0 && "fill-orange-500/20")} />
        {streak}
      </p>
    </div>
  )
}
