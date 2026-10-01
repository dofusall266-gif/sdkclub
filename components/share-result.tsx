"use client"

import { Check, Share2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"

/** Bouton « Partager mon résultat ».
 * Sur téléphone : ouvre la feuille de partage native (WhatsApp, Messages, X…).
 * Sur ordinateur : copie le texte dans le presse-papiers (+ lien pour publier sur X).
 * Le lien contient utm_source=share pour voir dans Google Analytics combien de
 * visiteurs viennent des partages. */
export function ShareResult({ text, className }: { text: string; className?: string }) {
  const { t } = useLanguage()
  const [copied, setCopied] = useState(false)

  const share = async () => {
    try {
      if (typeof navigator.share === "function") {
        await navigator.share({ text })
        return
      }
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Partage annulé par la personne, ou presse-papiers refusé : rien à faire.
    }
  }

  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(text)}`

  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" onClick={share} aria-live="polite">
          {copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
          {copied ? t.share.copied : t.share.button}
        </Button>
        <a
          href={xUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t.share.onX}
          title={t.share.onX}
          className="grid h-9 w-9 place-items-center rounded-md border border-border text-sm font-bold transition-colors hover:bg-accent"
        >
          𝕏
        </a>
      </div>
    </div>
  )
}
