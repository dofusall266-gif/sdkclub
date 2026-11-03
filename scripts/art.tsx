/** Illustrations vectorielles des articles et des leçons (dessinées en SVG, aux couleurs du site). */
import type { ReactElement } from "react"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Brain, History, Newspaper, Trophy, Users } from "lucide-react"

export const COLORS = {
  bg: "#1E140F",
  panel: "#2A1D15",
  line: "#4A3A2C",
  sage: "#A7AD78",
  sageDark: "#7C8456",
  cream: "#F5EAD9",
  sand: "#D9C3A0",
  muted: "#9C8A75",
  red: "#E5736B",
  water: "#3B4A44",
}

const C = COLORS

/** Swordfish (espadon) — long bec, grande nageoire dorsale, queue en croissant. */
export function SwordfishArt({ width }: { width: number }): ReactElement {
  return (
    <svg width={width} height={(width * 300) / 520} viewBox="0 0 520 300">
      {/* vagues */}
      <path d="M20 250 q30 -22 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke={C.water} strokeWidth="6" strokeLinecap="round" />
      <path d="M-10 280 q30 -22 60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0 t60 0" fill="none" stroke={C.water} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
      {/* nageoire dorsale */}
      <path d="M250 112 C 262 70, 292 40, 318 28 C 322 62, 330 92, 348 118 Z" fill={C.sageDark} />
      {/* queue en croissant */}
      <path d="M418 150 C 440 120, 470 96, 500 84 C 488 118, 486 138, 490 150 C 486 162, 488 182, 500 216 C 470 204, 440 180, 418 150 Z" fill={C.sageDark} />
      {/* nageoire ventrale */}
      <path d="M300 178 C 290 206, 276 222, 258 232 C 290 232, 318 218, 332 184 Z" fill={C.sageDark} />
      {/* corps */}
      <path d="M150 146 C 190 112, 270 98, 340 108 C 380 114, 405 130, 424 150 C 405 170, 380 186, 340 192 C 270 202, 190 188, 150 154 Z" fill={C.sage} />
      {/* ventre */}
      <path d="M160 156 C 200 180, 270 192, 340 190 C 380 186, 405 172, 420 154 C 380 168, 300 172, 230 166 C 200 164, 178 160, 160 156 Z" fill={C.cream} opacity="0.9" />
      {/* bec (l'épée) */}
      <path d="M150 146 L 18 148 L 150 154 Z" fill={C.sand} />
      {/* ligne de côté + branchies */}
      <path d="M192 152 C 250 142, 330 142, 400 150" fill="none" stroke={C.sageDark} strokeWidth="2" opacity="0.6" />
      <path d="M205 130 C 214 142, 214 160, 205 172" fill="none" stroke={C.sageDark} strokeWidth="3" strokeLinecap="round" />
      {/* œil */}
      <circle cx="186" cy="142" r="9" fill={C.bg} />
      <circle cx="189" cy="139" r="3" fill={C.cream} />
    </svg>
  )
}

/** X-Wing : les quatre coins d'un rectangle reliés en X. */
export function XWingArt({ width }: { width: number }): ReactElement {
  const pts: [number, number][] = [[110, 60], [410, 60], [110, 240], [410, 240]]
  return (
    <svg width={width} height={(width * 300) / 520} viewBox="0 0 520 300">
      <rect x="110" y="60" width="300" height="180" fill="none" stroke={C.line} strokeWidth="4" strokeDasharray="10 10" />
      <line x1="110" y1="60" x2="410" y2="240" stroke={C.sage} strokeWidth="8" strokeLinecap="round" />
      <line x1="410" y1="60" x2="110" y2="240" stroke={C.sage} strokeWidth="8" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 34} y={y - 34} width="68" height="68" rx="16" fill={C.sage} />
          <rect x={x - 34} y={y - 34} width="68" height="68" rx="16" fill="none" stroke={C.cream} strokeWidth="3" opacity="0.7" />
        </g>
      ))}
      {/* candidats éliminés, sur le prolongement des colonnes */}
      {[[110, 150], [410, 150]].map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="20" fill={C.red} opacity="0.2" />
          <line x1={x - 12} y1={y - 12} x2={x + 12} y2={y + 12} stroke={C.red} strokeWidth="5" strokeLinecap="round" />
          <line x1={x + 12} y1={y - 12} x2={x - 12} y2={y + 12} stroke={C.red} strokeWidth="5" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  )
}

/** Y-Wing : un pivot et deux ailes en forme de Y. */
export function YWingArt({ width }: { width: number }): ReactElement {
  return (
    <svg width={width} height={(width * 300) / 520} viewBox="0 0 520 300">
      <path d="M110 55 L 260 150 L 410 55" fill="none" stroke={C.sage} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M260 150 L 260 255" fill="none" stroke={C.sage} strokeWidth="8" strokeLinecap="round" />
      {/* ailes */}
      {[[110, 55], [410, 55]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 38} y={y - 38} width="76" height="76" rx="18" fill={C.sand} />
          <rect x={x - 38} y={y - 38} width="76" height="76" rx="18" fill="none" stroke={C.cream} strokeWidth="3" opacity="0.6" />
        </g>
      ))}
      {/* pivot */}
      <rect x="215" y="105" width="90" height="90" rx="20" fill={C.sage} />
      <rect x="215" y="105" width="90" height="90" rx="20" fill="none" stroke={C.cream} strokeWidth="4" opacity="0.8" />
      {/* case dont on retire le candidat */}
      <circle cx="260" cy="255" r="30" fill={C.red} opacity="0.2" />
      <line x1="244" y1="239" x2="276" y2="271" stroke={C.red} strokeWidth="6" strokeLinecap="round" />
      <line x1="276" y1="239" x2="244" y2="271" stroke={C.red} strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/** Guide : un escalier de niveaux, du plus simple au plus avancé, avec un fanion. */
export function StairsArt({ width }: { width: number }): ReactElement {
  const steps = [0, 1, 2, 3]
  return (
    <svg width={width} height={(width * 300) / 520} viewBox="0 0 520 300">
      {steps.map((i) => (
        <rect key={i} x={50 + i * 105} y={230 - i * 55} width="100" height={50 + i * 55} rx="10" fill={[C.sand, C.sage, C.sageDark, C.cream][i]} opacity={i === 3 ? 0.95 : 1} />
      ))}
      <line x1="440" y1="60" x2="440" y2="10" stroke={C.cream} strokeWidth="5" strokeLinecap="round" />
      <path d="M440 12 L 490 28 L 440 44 Z" fill={C.red} />
    </svg>
  )
}

/** Icône Lucide en grand (cerveau, sablier, trophée…), sur un disque doux. */
export function IconArt({ name, width }: { name: "brain" | "history" | "trophy" | "users" | "newspaper"; width: number }): ReactElement {
  const size = Math.round(width * 0.46)
  const Icon = { brain: Brain, history: History, trophy: Trophy, users: Users, newspaper: Newspaper }[name]
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width, height: (width * 300) / 520 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: size + 90, height: size + 90, borderRadius: 999, background: "rgba(167,173,120,0.14)", border: `3px solid ${C.line}` }}>
        {/* satori ne sait pas faire tourner les composants Lucide (ils utilisent des hooks) :
            on les transforme d'abord en SVG, puis en image. */}
        <img
          width={size}
          height={size}
          src={`data:image/svg+xml;utf8,${encodeURIComponent(renderToStaticMarkup(createElement(Icon, { size, strokeWidth: 1.4, color: C.sage })))}`}
        />
      </div>
    </div>
  )
}

/** Logo Sudoku-Club en grand. */
export function LogoArt({ width }: { width: number }): ReactElement {
  const s = Math.round(width * 0.5)
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width, height: (width * 300) / 520 }}>
      <svg width={s * 0.8} height={s * 0.8} viewBox="2 2 20 20">
        <rect x="2" y="2" width="20" height="20" rx="5" fill={C.sage} />
        <g stroke={C.bg} strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
          <line x1="9.33" y1="4.5" x2="9.33" y2="19.5" /><line x1="14.67" y1="4.5" x2="14.67" y2="19.5" />
          <line x1="4.5" y1="9.33" x2="19.5" y2="9.33" /><line x1="4.5" y1="14.67" x2="19.5" y2="14.67" />
        </g>
      </svg>
    </div>
  )
}

export const ART_FOR_SLUG: Record<string, (w: number) => ReactElement> = {
  "technique-swordfish": (w) => <SwordfishArt width={w} />,
  "technique-x-wing": (w) => <XWingArt width={w} />,
  "technique-y-wing": (w) => <YWingArt width={w} />,
  "guide-techniques-sudoku": (w) => <StairsArt width={w} />,
  "bienfaits-sudoku-cerveau-sante": (w) => <IconArt name="brain" width={w} />,
  "histoire-du-sudoku": (w) => <IconArt name="history" width={w} />,
  "meilleurs-sites-sudoku-en-ligne": (w) => <IconArt name="trophy" width={w} />,
  "sudoku-bienfaits-tout-age": (w) => <IconArt name="users" width={w} />,
  "sudoku-culture-populaire": (w) => <IconArt name="newspaper" width={w} />,
  "pourquoi-sudoku-club-meilleur-site-sudoku": (w) => <LogoArt width={w} />,
}
