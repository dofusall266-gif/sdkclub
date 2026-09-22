"use client"

import { Flame } from "lucide-react"
import { useEffect, useState } from "react"

import { getStreak } from "@/lib/streak"
import { cn } from "@/lib/utils"

/** Petit badge "🔥 N jours" lu depuis le stockage local. N'affiche rien tant que
 * la série est à 0 (pas encore de partie gagnée), pour ne pas polluer l'en-tête. */
export function StreakBadge({ className, pulse }: { className?: string; pulse?: boolean }) {
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    setStreak(getStreak())
    // Se met à jour si une victoire vient de se produire ailleurs sur la page.
    const onUpdate = () => setStreak(getStreak())
    window.addEventListener("sc:streak-updated", onUpdate)
    return () => window.removeEventListener("sc:streak-updated", onUpdate)
  }, [])

  if (!streak) return null

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-orange-500/10 px-2.5 py-1 text-sm font-semibold text-orange-600 dark:text-orange-400",
        pulse && "animate-flame-pop",
        className,
      )}
      title={`Série en cours : ${streak} jour${streak > 1 ? "s" : ""}`}
    >
      <Flame className="size-4 fill-orange-500/20" />
      {streak}
    </div>
  )
}
