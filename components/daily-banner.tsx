"use client"

import { Flame, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
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
    <div className="relative mx-auto mb-5 w-full overflow-hidden rounded-2xl bg-[image:linear-gradient(135deg,var(--frame-a),var(--frame-b))] px-5 py-4 shadow-sm lg:max-w-none">
      <button
        type="button"
        aria-label={t.daily.bannerDismiss}
        onClick={() => {
          writeJSON(DISMISS_KEY, todayKey())
          setVisible(false)
        }}
        className="absolute right-3 top-3 rounded-full p-1 text-secondary/70 hover:bg-white/10 hover:text-secondary"
      >
        <X className="size-4" />
      </button>

      <div className="flex flex-wrap items-center justify-between gap-4 pr-6">
        <div className="flex min-w-0 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-secondary/80">
            <Flame className="size-3.5" />
            {t.nav.daily}
          </span>
          <span className="truncate text-base font-semibold text-secondary sm:text-lg">
            {t.daily.bannerText}
          </span>
        </div>

        <Button asChild size="lg" className="shrink-0 bg-secondary text-foreground hover:bg-secondary/90">
          <Link href="/defi">{t.nav.play}</Link>
        </Button>
      </div>
    </div>
  )
}
