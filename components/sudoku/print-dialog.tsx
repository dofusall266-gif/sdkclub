"use client"

import { Button } from "@/components/ui/button"

export function PrintDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (includeSolution: boolean) => void
}) {
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
          Imprimer la grille
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Voulez-vous inclure la solution sur une deuxième page&nbsp;?
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={() => onConfirm(false)}>Imprimer sans la solution</Button>
          <Button variant="outline" onClick={() => onConfirm(true)}>
            Imprimer avec la solution (page 2)
          </Button>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
