import { useId } from "react"

export function SudokuLogo({ className }: { className?: string }) {
  const gradientId = useId()
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--frame-a)" }} />
          <stop offset="100%" style={{ stopColor: "var(--frame-b)" }} />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" fill={`url(#${gradientId})`} />
      <g stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" className="text-primary-foreground opacity-90">
        <line x1="9.33" y1="4.5" x2="9.33" y2="19.5" />
        <line x1="14.67" y1="4.5" x2="14.67" y2="19.5" />
        <line x1="4.5" y1="9.33" x2="19.5" y2="9.33" />
        <line x1="4.5" y1="14.67" x2="19.5" y2="14.67" />
      </g>
    </svg>
  )
}
