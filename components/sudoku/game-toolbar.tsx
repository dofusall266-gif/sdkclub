"use client"

import { Eraser, Pencil, Printer, Undo2 } from "lucide-react"

import { useLanguage } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

interface GameToolbarProps {
  notesMode: boolean
  canUndo: boolean
  disabled?: boolean
  onToggleNotes: () => void
  onUndo: () => void
  onErase: () => void
  onPrint: () => void
}

/** Rangée de 4 boutons ronds (annuler, effacer, notes, imprimer), façon sudoku.com. */
export function GameToolbar({
  notesMode,
  canUndo,
  disabled,
  onToggleNotes,
  onUndo,
  onErase,
  onPrint,
}: GameToolbarProps) {
  const { t } = useLanguage()

  return (
    <div className="flex items-center justify-between gap-2 px-1 sm:px-3 lg:px-1">
      <ToolButton label={t.toolbar.undo} onClick={onUndo} disabled={disabled || !canUndo}>
        <Undo2 className="size-5 lg:size-6" />
      </ToolButton>
      <ToolButton label={t.toolbar.erase} onClick={onErase} disabled={disabled}>
        <Eraser className="size-5 lg:size-6" />
      </ToolButton>
      <ToolButton
        label={t.toolbar.notes}
        onClick={onToggleNotes}
        active={notesMode}
        disabled={disabled}
        badge={notesMode ? t.toolbar.on : t.toolbar.off}
      >
        <Pencil className="size-5 lg:size-6" />
      </ToolButton>
      <ToolButton label={t.toolbar.print} onClick={onPrint}>
        <Printer className="size-5 lg:size-6" />
      </ToolButton>
    </div>
  )
}

function ToolButton({
  children,
  label,
  onClick,
  disabled,
  active,
  badge,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  active?: boolean
  badge?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "relative grid size-12 place-items-center rounded-full transition-colors lg:size-14",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-primary/10 text-primary hover:bg-primary/20 active:bg-primary/25",
      )}
    >
      {children}
      {badge && (
        <span
          className={cn(
            "absolute -top-1 -right-1 rounded-full px-1.5 py-0.5 text-[0.6rem] leading-none font-bold tracking-wide",
            active ? "bg-foreground text-background" : "bg-muted-foreground/70 text-background",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
