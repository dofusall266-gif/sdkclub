"use client"

import { useEffect } from "react"

/** Enregistre le service worker (production uniquement, pour ne pas gêner le développement). */
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return
    if (!("serviceWorker" in navigator)) return
    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Échec silencieux : le site marche très bien sans service worker.
    })
  }, [])
  return null
}
