"use client"

/** Message d'encouragement qui descend du haut de l'écran aux paliers de combo (3, 7, 10, 20). */
export function ComboToast({ toast }: { toast: { id: number; text: string; sub: string } | null }) {
  if (!toast) return null
  return (
    <div
      key={toast.id}
      role="status"
      aria-live="polite"
      className="animate-combo-toast pointer-events-none fixed top-[calc(0.75rem+env(safe-area-inset-top))] left-1/2 z-50 rounded-2xl bg-primary px-6 py-3 text-center font-bold text-primary-foreground shadow-xl"
    >
      <span className="block text-lg sm:text-xl">{toast.text}</span>
      <span className="block text-xs font-medium opacity-90">{toast.sub}</span>
    </div>
  )
}
