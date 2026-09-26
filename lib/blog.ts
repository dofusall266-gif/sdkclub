import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

export interface BlogPostMeta {
  slug: string
  title: string
  date: string // YYYY-MM-DD
  excerpt: string
  category: string
}

export interface BlogPost extends BlogPostMeta {
  /** Contenu Markdown brut (pas encore converti en HTML). */
  content: string
}

function readFrontmatter(filename: string): { slug: string; data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8")
  const { data, content } = matter(raw)
  return { slug: filename.replace(/\.md$/, ""), data, content }
}

/** Liste tous les articles (métadonnées seulement), triés du plus récent au
 * plus ancien. Lit directement le dossier content/blog/ : ajouter un fichier
 * .md suffit, pas besoin de toucher au code. */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .map((filename) => {
      const { slug, data } = readFrontmatter(filename)
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? "1970-01-01"),
        excerpt: String(data.excerpt ?? ""),
        category: String(data.category ?? ""),
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getPostBySlug(slug: string): BlogPost | null {
  if (slug.toLowerCase() === "readme") return null
  const filename = `${slug}.md`
  if (!fs.existsSync(path.join(BLOG_DIR, filename))) return null
  const { data, content } = readFrontmatter(filename)
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? "1970-01-01"),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? ""),
    content,
  }
}

export function formatBlogDate(dateStr: string, locale: "fr" | "en"): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}
