"use client"

import { Flame, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { hasCompletedDailyToday, todayKey } from "@/lib/daily"
import { useLanguage } from "@/lib/i18n/context"
import { readJSON, writeJSON } from "@/lib/storage"

const DISMISS_KEY = "sc_daily_banner_dismissed_v1"

export function DailyBanner() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const today = todayKey()
    const dismissedFor = readJSON<string>(DISMISS_KEY)
    if (dismissedFor === today) return
    if (hasCompletedDailyToday()) return
    setVisible(true)
  }, [])

  if (!visible) return null

  return (
    <div className="mx-auto mb-5 flex w-full max-w-[36rem] items-center justify-between gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 lg:max-w-none">
      <Link href="/defi" className="flex min-w-0 items-center gap-2.5 text-sm font-medium text-orange-700 dark:text-orange-300">
        <Flame className="size-4 shrink-0" />
        <span className="truncate">{t.daily.bannerText}</span>
      </Link>
      <button
        type="button"
        aria-label={t.daily.bannerDismiss}
        onClick={() => {
          writeJSON(DISMISS_KEY, todayKey())
          setVisible(false)
        }}
        className="shrink-0 rounded-full p-1 text-orange-700/70 hover:bg-orange-500/15 dark:text-orange-300/70"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
