/**
 * Fabrique les images des articles (couvertures 1200×630 + schémas) dans public/blog/.
 * Usage : node gen-blog-images.cjs   (depuis la racine du projet)
 * - couverture de chaque article : titre + grille (le motif de la technique pour les articles techniques) ;
 * - schémas « diagram-*.png » : le motif sur une vraie grille, sans texte (la légende est dans l'article).
 */
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { ImageResponse } from "next/og"

import { TRAINING_CASES } from "../lib/training-cases"
import { decodeCase, type DecodedCase, type TrainingPattern, type TrainingTech } from "../lib/training"

const BG = "#1E140F"
const CARD = "#2A1D15"
const FG = "#F5EAD9"
const MUTED = "#9C8A75"
const PRIMARY = "#A7AD78"
const RED = "#E5736B"
const LINE = "#4A3A2C"
const THICK = "#7A6A55"

const out = path.join(process.cwd(), "public", "blog")
fs.mkdirSync(out, { recursive: true })

/** Grille du schéma : seules les notes utiles sont affichées. */
function DiagramBoard({ dc, pattern, size, mode }: { dc: DecodedCase; pattern: TrainingPattern; size: number; mode: "digit" | "cells" }) {
  const cell = size / 9
  const pat = new Set(pattern.c)
  const el = new Set(pattern.e)
  const baseLines = new Set<string>()
  if (pattern.l) for (const b of pattern.l.b) baseLines.add(`${pattern.l.k}${b}`)
  const coverLines = new Set<string>()
  if (pattern.l) for (const v of pattern.l.v) coverLines.add(`${pattern.l.k === "r" ? "c" : "r"}${v}`)
  return (
    <div style={{ display: "flex", flexDirection: "column", width: size, height: size, background: CARD, border: `4px solid ${THICK}`, borderRadius: 18, overflow: "hidden" }}>
      {Array.from({ length: 9 }, (_, r) => (
        <div key={r} style={{ display: "flex", height: cell }}>
          {Array.from({ length: 9 }, (_, c) => {
            const i = r * 9 + c
            const isPat = pat.has(i)
            const isElim = el.has(i)
            const onBase = baseLines.has(`r${r}`) || baseLines.has(`c${c}`)
            const onCover = coverLines.has(`r${r}`) || coverLines.has(`c${c}`)
            const showDigits = (d: number) => {
              if (dc.values[i] !== 0) return false
              if (mode === "digit") return dc.candidates[i].includes(d) && d === pattern.d
              return (isPat || isElim) && dc.candidates[i].includes(d) && (isPat || d === pattern.d)
            }
            return (
              <div
                key={c}
                style={{
                  display: "flex",
                  width: cell,
                  height: cell,
                  background: isPat ? "rgba(167,173,120,0.38)" : onBase ? "rgba(167,173,120,0.13)" : onCover ? "rgba(255,255,255,0.05)" : "transparent",
                  borderRight: c === 8 ? "0" : `${c % 3 === 2 ? 3 : 1}px solid ${c % 3 === 2 ? THICK : LINE}`,
                  borderBottom: r === 8 ? "0" : `${r % 3 === 2 ? 3 : 1}px solid ${r % 3 === 2 ? THICK : LINE}`,
                  position: "relative",
                }}
              >
                {dc.values[i] !== 0 ? (
                  <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", fontSize: cell * 0.5, color: "#5E4F3F" }}>{dc.values[i]}</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: 2 }}>
                    {[0, 1, 2].map((rr) => (
                      <div key={rr} style={{ display: "flex", flex: 1 }}>
                        {[0, 1, 2].map((cc) => {
                          const d = rr * 3 + cc + 1
                          const on = showDigits(d)
                          const eliminated = on && isElim && d === pattern.d
                          return (
                            <div
                              key={cc}
                              style={{
                                display: "flex",
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: cell * 0.4,
                                fontWeight: 700,
                                color: on ? (eliminated ? RED : PRIMARY) : "transparent",
                                textDecoration: eliminated ? "line-through" : "none",
                              }}
                            >
                              {d}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** Grille décorative (couvertures des articles généraux). */
function DecorBoard({ size }: { size: number }) {
  const cell = size / 9
  const digit = (r: number, c: number) => ((r * 3 + Math.floor(r / 3) + c) % 9) + 1
  const visible = (r: number, c: number) => (r * 7 + c * 5 + r * c) % 9 < 4
  return (
    <div style={{ display: "flex", flexDirection: "column", width: size, height: size, background: CARD, border: `4px solid ${PRIMARY}`, borderRadius: 18, overflow: "hidden" }}>
      {Array.from({ length: 9 }, (_, r) => (
        <div key={r} style={{ display: "flex", height: cell }}>
          {Array.from({ length: 9 }, (_, c) => (
            <div
              key={c}
              style={{
                display: "flex",
                width: cell,
                height: cell,
                alignItems: "center",
                justifyContent: "center",
                fontSize: cell * 0.55,
                fontWeight: 700,
                color: (r + c) % 5 === 0 ? PRIMARY : FG,
                borderRight: c === 8 ? "0" : `${c % 3 === 2 ? 3 : 1}px solid ${c % 3 === 2 ? PRIMARY : LINE}`,
                borderBottom: r === 8 ? "0" : `${r % 3 === 2 ? 3 : 1}px solid ${r % 3 === 2 ? PRIMARY : LINE}`,
              }}
            >
              {visible(r, c) ? digit(r, c) : ""}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800, color: FG }}>
      <span>Sudoku</span>
      <div style={{ display: "flex", width: 20, height: 8, borderRadius: 5, background: `linear-gradient(90deg, ${FG}, ${PRIMARY})`, margin: "4px 4px 0 4px" }} />
      <span style={{ color: PRIMARY }}>Club</span>
    </div>
  )
}

async function save(name: string, element: React.ReactElement, width: number, height: number) {
  const res = new ImageResponse(element, { width, height })
  fs.writeFileSync(path.join(out, name), Buffer.from(await res.arrayBuffer()))
  console.log("écrit", name)
}

const TECH_FOR_SLUG: Record<string, TrainingTech> = { "technique-x-wing": "x_wing", "technique-swordfish": "swordfish", "technique-y-wing": "xy_wing" }
const DIAGRAMS: Record<string, { tech: TrainingTech; mode: "digit" | "cells" }> = {
  "x-wing": { tech: "x_wing", mode: "digit" },
  "swordfish": { tech: "swordfish", mode: "digit" },
  "y-wing": { tech: "xy_wing", mode: "cells" },
}

async function main() {
  // 1) schémas
  for (const [name, { tech, mode }] of Object.entries(DIAGRAMS)) {
    const dc = decodeCase(TRAINING_CASES[tech][0])
    await save(`diagram-${name}.png`, <div style={{ display: "flex", width: "100%", height: "100%", background: BG, alignItems: "center", justifyContent: "center" }}><DiagramBoard dc={dc} pattern={dc.patterns[0]} size={720} mode={mode} /></div>, 800, 800)
  }

  // 2) couvertures
  const dir = path.join(process.cwd(), "content", "blog")
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md") && x.toLowerCase() !== "readme.md")) {
    const slug = f.replace(/\.md$/, "")
    const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"))
    const tech = TECH_FOR_SLUG[slug]
    const title = String(data.title)
    const category = String(data.category ?? "")
    let board: React.ReactElement
    if (tech) {
      const dc = decodeCase(TRAINING_CASES[tech][0])
      board = <DiagramBoard dc={dc} pattern={dc.patterns[0]} size={470} mode={tech === "xy_wing" ? "cells" : "digit"} />
    } else {
      board = <DecorBoard size={470} />
    }
    await save(
      `${slug}.png`,
      <div style={{ display: "flex", width: "100%", height: "100%", background: BG, alignItems: "center", justifyContent: "space-between", padding: "0 70px", color: FG }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 470, width: 560 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {category ? (
              <div style={{ display: "flex", alignSelf: "flex-start", padding: "6px 18px", borderRadius: 999, border: `2px solid ${LINE}`, color: PRIMARY, fontSize: 24, marginBottom: 26 }}>{category}</div>
            ) : null}
            <div style={{ display: "flex", fontSize: title.length > 60 ? 46 : 54, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 }}>{title}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Wordmark />
            <div style={{ display: "flex", fontSize: 24, color: MUTED }}>sudoku-club.com</div>
          </div>
        </div>
        {board}
      </div>,
      1200,
      630,
    )
  }
}
main()
