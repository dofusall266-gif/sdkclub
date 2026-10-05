import { ImageResponse } from "next/og"

// Image de partage (Open Graph) générée au build : affichée par X/Twitter,
// Facebook, WhatsApp, Discord, iMessage, LinkedIn… quand on colle le lien.
// Texte bilingue : les robots des réseaux ne lisent pas le sélecteur de langue.
export const alt = "Sudoku Club — Free online Sudoku · Sudoku gratuit en ligne"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG = "#1E140F"
const CARD = "#2A1D15"
const FG = "#F5EAD9"
const MUTED = "#C9B79E"
const PRIMARY = "#A7AD78"
const LINE_THIN = "#4A3A2C"
const LINE_THICK = PRIMARY

// Grille valide (motif classique) + masque de cases visibles.
function digit(r: number, c: number): number {
  return ((r * 3 + Math.floor(r / 3) + c) % 9) + 1
}
function visible(r: number, c: number): boolean {
  return (r * 7 + c * 5 + r * c) % 9 < 4
}

export default function OpengraphImage() {
  const CELL = 52
  const rows = Array.from({ length: 9 }, (_, r) => r)

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: BG,
          padding: "0 80px",
          color: FG,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 560 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* Même logo que components/sudoku-logo.tsx */}
            <svg width="64" height="64" viewBox="0 0 24 24">
              <rect x="2" y="2" width="20" height="20" rx="5" fill={PRIMARY} />
              <g stroke={BG} strokeWidth="1.3" strokeLinecap="round" opacity="0.9">
                <line x1="9.33" y1="4.5" x2="9.33" y2="19.5" />
                <line x1="14.67" y1="4.5" x2="14.67" y2="19.5" />
                <line x1="4.5" y1="9.33" x2="19.5" y2="9.33" />
                <line x1="4.5" y1="14.67" x2="19.5" y2="14.67" />
              </g>
            </svg>
            <div style={{ display: "flex", alignItems: "center", fontSize: 44, fontWeight: 800, letterSpacing: -1 }}>
              <span>Sudoku</span>
              <div
                style={{
                  display: "flex",
                  width: 27,
                  height: 10,
                  borderRadius: 6,
                  background: `linear-gradient(90deg, ${FG}, ${PRIMARY})`,
                  margin: "5px 5px 0 5px",
                }}
              />
              <span style={{ color: PRIMARY }}>Club</span>
            </div>
          </div>

          <div style={{ marginTop: 44, fontSize: 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            Free online Sudoku
          </div>
          <div style={{ marginTop: 14, fontSize: 36, color: PRIMARY, fontWeight: 600 }}>Sudoku gratuit en ligne</div>

          <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 12 }}>
            {["6 levels · 6 niveaux", "Daily challenge", "No sign-up"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "8px 18px",
                  borderRadius: 999,
                  border: `2px solid ${LINE_THIN}`,
                  color: MUTED,
                  fontSize: 24,
                }}
              >
                {label}
              </div>
            ))}
          </div>
          <div style={{ marginTop: 36, fontSize: 28, color: MUTED }}>sudoku-club.com</div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            background: CARD,
            border: `4px solid ${LINE_THICK}`,
            borderRadius: 20,
            padding: 0,
            overflow: "hidden",
          }}
        >
          {rows.map((r) => (
            <div key={r} style={{ display: "flex" }}>
              {rows.map((c) => (
                <div
                  key={c}
                  style={{
                    width: CELL,
                    height: CELL,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 30,
                    fontWeight: 700,
                    color: (r + c) % 5 === 0 ? PRIMARY : FG,
                    borderRight: c === 8 ? "0" : `${c % 3 === 2 ? 3 : 1}px solid ${c % 3 === 2 ? LINE_THICK : LINE_THIN}`,
                    borderBottom: r === 8 ? "0" : `${r % 3 === 2 ? 3 : 1}px solid ${r % 3 === 2 ? LINE_THICK : LINE_THIN}`,
                  }}
                >
                  {visible(r, c) ? digit(r, c) : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  )
}
