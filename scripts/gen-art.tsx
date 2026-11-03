/** Fabrique les images illustrées : node gen-art.cjs  →  public/blog/<slug>.png (illustration seule) et og-<slug>.png (avec le titre). */
import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { ImageResponse } from "next/og"

import { ART_FOR_SLUG, COLORS as C } from "./art"

const out = path.join(process.cwd(), "public", "blog")
fs.mkdirSync(out, { recursive: true })

async function save(name: string, element: React.ReactElement, width: number, height: number) {
  const res = new ImageResponse(element, { width, height })
  fs.writeFileSync(path.join(out, name), Buffer.from(await res.arrayBuffer()))
  console.log("écrit", name)
}

function Wordmark() {
  return (
    <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 800, color: C.cream }}>
      <span>Sudoku</span>
      <div style={{ display: "flex", width: 20, height: 8, borderRadius: 5, background: `linear-gradient(90deg, ${C.cream}, ${C.sage})`, margin: "4px 4px 0 4px" }} />
      <span style={{ color: C.sage }}>Club</span>
    </div>
  )
}

const backdrop = `radial-gradient(circle at 70% 45%, rgba(167,173,120,0.22), rgba(30,20,15,0) 60%), ${C.bg}`

async function main() {
  const dir = path.join(process.cwd(), "content", "blog")
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".md") && x.toLowerCase() !== "readme.md")) {
    const slug = f.replace(/\.md$/, "")
    const art = ART_FOR_SLUG[slug]
    if (!art) continue
    const { data } = matter(fs.readFileSync(path.join(dir, f), "utf8"))
    const title = String(data.title)
    const category = String(data.category ?? "")

    // 1) illustration seule (en-tête d'article, liste, cartes)
    await save(
      `${slug}.png`,
      <div style={{ display: "flex", width: "100%", height: "100%", background: backdrop, alignItems: "center", justifyContent: "center" }}>{art(940)}</div>,
      1200,
      630,
    )

    // 2) visuel de partage : titre + illustration
    await save(
      `og-${slug}.png`,
      <div style={{ display: "flex", width: "100%", height: "100%", background: backdrop, alignItems: "center", justifyContent: "space-between", padding: "0 64px", color: C.cream }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: 470, width: 540 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {category ? <div style={{ display: "flex", alignSelf: "flex-start", padding: "6px 18px", borderRadius: 999, border: `2px solid ${C.line}`, color: C.sage, fontSize: 24, marginBottom: 26 }}>{category}</div> : null}
            <div style={{ display: "flex", fontSize: title.length > 60 ? 44 : 52, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 }}>{title}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Wordmark />
            <div style={{ display: "flex", fontSize: 24, color: C.muted }}>sudoku-club.com</div>
          </div>
        </div>
        {art(520)}
      </div>,
      1200,
      630,
    )
  }
}
main()
