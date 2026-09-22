"use client"

import { useLanguage } from "@/lib/i18n/context"

export function DailyIntro() {
  const { t } = useLanguage()
  return (
    <div className="mx-auto mb-6 max-w-[36rem] text-center lg:max-w-none">
      <h1 className="text-2xl font-bold">{t.daily.title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t.daily.subtitle}</p>
    </div>
  )
}
