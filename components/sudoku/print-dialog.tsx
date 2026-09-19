"use client"

import { Button } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"

export function PrintDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (includeSolution: boolean) => void
}) {
  const { t } = useLanguage()
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 print:hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="print-dialog-title" className="text-lg font-bold">
          {t.printDialog.title}
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">{t.printDialog.question}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={() => onConfirm(false)}>{t.printDialog.without}</Button>
          <Button variant="outline" onClick={() => onConfirm(true)}>
            {t.printDialog.with}
          </Button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {t.printDialog.cancel}
        </button>
      </div>
    </div>
  )
}
