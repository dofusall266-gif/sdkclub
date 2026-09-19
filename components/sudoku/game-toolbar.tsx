"use client"

import { Eraser, Pencil, Printer, Undo2 } from "lucide-react"

import { Button } from "@/components/ui/button"
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
    <div className="grid grid-cols-4 gap-2">
      <ToolButton label={t.toolbar.undo} onClick={onUndo} disabled={disabled || !canUndo}>
        <Undo2 className="size-5" />
      </ToolButton>
      <ToolButton label={t.toolbar.erase} onClick={onErase} disabled={disabled}>
        <Eraser className="size-5" />
      </ToolButton>
      <ToolButton
        label={t.toolbar.notes}
        onClick={onToggleNotes}
        active={notesMode}
        disabled={disabled}
        badge={notesMode ? t.toolbar.on : t.toolbar.off}
      >
        <Pencil className="size-5" />
      </ToolButton>
      <ToolButton label={t.toolbar.print} onClick={onPrint}>
        <Printer className="size-5" />
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
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex h-auto flex-col gap-1 py-2.5",
        active && "border-primary bg-primary/10 text-primary",
      )}
    >
      <span className="relative">
        {children}
        {badge && (
          <span className="absolute -top-2 -right-4 text-[0.55rem] font-bold tracking-wide">{badge}</span>
        )}
      </span>
      <span className="text-[0.65rem] font-medium">{label}</span>
    </Button>
  )
}
