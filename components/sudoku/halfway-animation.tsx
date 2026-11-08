"use client"

/** Animation de mi-parcours : une pomme coupée en deux, au centre de la grille (durée : 2,2 s). */
export function HalfwayAnimation({ id, label }: { id: number | null; label: string }) {
  if (id === null) return null
  return (
    <div key={id} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
      <div className="animate-half-card rounded-3xl border border-border bg-card px-8 py-5 text-center shadow-2xl">
        <svg viewBox="0 0 100 100" width="130" height="130" className="mx-auto overflow-visible">
          <defs>
            <clipPath id="hw-left">
              <rect x="0" y="0" width="50" height="100" />
            </clipPath>
            <clipPath id="hw-right">
              <rect x="50" y="0" width="50" height="100" />
            </clipPath>
            <g id="hw-apple">
              <path
                d="M50 30C30 18 8 32 12 58C15 82 35 94 50 88C65 94 85 82 88 58C92 32 70 18 50 30Z"
                fill="#C6382E"
              />
              <path d="M50 30C50 22 52 16 56 12" stroke="#593E2E" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M54 20C62 8 76 10 78 14C72 22 62 24 54 20Z" fill="#6E9B2E" />
            </g>
          </defs>
          <use href="#hw-apple" clipPath="url(#hw-left)" className="apple-left" />
          <use href="#hw-apple" clipPath="url(#hw-right)" className="apple-right" />
          <line
            x1="50"
            y1="0"
            x2="50"
            y2="100"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            pathLength={100}
            className="apple-cut text-foreground"
          />
        </svg>
        <p className="mt-1 text-xl font-bold">{label}</p>
      </div>
    </div>
  )
}
