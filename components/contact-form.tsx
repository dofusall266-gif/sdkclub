"use client"

import { CheckCircle2, Send } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { CONTACT_EMAIL } from "@/lib/site-config"

export function ContactForm() {
  const [sent, setSent] = useState(false)
  const { t } = useLanguage()
  const c = t.contact

  if (sent) {
    return (
      <div className="rounded-2xl border border-border bg-secondary/40 p-8 text-center">
        <CheckCircle2 className="mx-auto size-10 text-primary" />
        <h2 className="mt-4 text-lg font-semibold">{c.sentTitle}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{c.sentText}</p>
        <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
          {c.sendAnother}
        </Button>
      </div>
    )
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const subject = encodeURIComponent(`Message de ${data.get("name")} — Sudoku Club`)
        const body = encodeURIComponent(`${data.get("message")}\n\n—\n${data.get("email")}`)
        window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
        setSent(true)
      }}
    >
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium">
          {c.nameLabel}
        </label>
        <input
          id="name"
          name="name"
          required
          autoComplete="name"
          className="h-11 rounded-lg border border-border bg-card px-3.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="email" className="text-sm font-medium">
          {c.emailLabel}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="h-11 rounded-lg border border-border bg-card px-3.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="message" className="text-sm font-medium">
          {c.messageLabel}
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="resize-y rounded-lg border border-border bg-card px-3.5 py-2.5 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      <Button type="submit" size="lg" className="w-full sm:w-auto">
        <Send className="size-4" /> {c.send}
      </Button>

      <p className="text-xs text-muted-foreground">
        {c.directEmail}{" "}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary underline-offset-4 hover:underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </form>
  )
}
