"use client"

import { useEffect } from "react"

import { sendVisitTime } from "@/lib/track"

const IDLE_AFTER_MS = 60_000
const FLUSH_EVERY_S = 60

/** Mesure le temps passé sur le site : une seconde est comptée seulement si l'onglet est visible
 * et si le joueur a fait quelque chose (clic, touche, toucher, défilement) dans la dernière minute. */
export function VisitTimer() {
  useEffect(() => {
    let pending = 0
    let lastActivity = Date.now()
    const bump = () => {
      lastActivity = Date.now()
    }
    const flush = () => {
      if (pending >= 3) {
        sendVisitTime(Math.min(pending, 3600))
        pending = 0
      }
    }
    const tick = window.setInterval(() => {
      if (!document.hidden && Date.now() - lastActivity < IDLE_AFTER_MS) {
        pending++
        if (pending >= FLUSH_EVERY_S) flush()
      }
    }, 1000)
    const onVisibility = () => {
      if (document.hidden) flush()
    }
    const events = ["pointerdown", "pointermove", "keydown", "touchstart", "scroll"] as const
    events.forEach((e) => window.addEventListener(e, bump, { passive: true }))
    document.addEventListener("visibilitychange", onVisibility)
    window.addEventListener("pagehide", flush)
    return () => {
      window.clearInterval(tick)
      events.forEach((e) => window.removeEventListener(e, bump))
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("pagehide", flush)
    }
  }, [])
  return null
}
