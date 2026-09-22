"use client"

export function ResetStatsButton({ action, label, confirmText }: { action: () => void; label: string; confirmText: string }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="rounded-lg border border-destructive/30 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/10"
      >
        {label}
      </button>
    </form>
  )
}
