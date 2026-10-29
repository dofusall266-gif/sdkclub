"use client"

import { useEffect } from "react"

import { captureSource } from "@/lib/track"

/** Note d'où vient le visiteur (YouTube, Facebook, Google…) dès son arrivée sur le site. */
export function SourceCapture() {
  useEffect(() => {
    captureSource()
  }, [])
  return null
}
