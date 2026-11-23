"use client"

/** Bouton d'envoi de formulaire qui demande confirmation avant d'agir. */
export function ConfirmSubmitButton({
  label,
  confirmText,
  className,
}: {
  label: string
  confirmText: string
  className?: string
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault()
      }}
    >
      {label}
    </button>
  )
}
