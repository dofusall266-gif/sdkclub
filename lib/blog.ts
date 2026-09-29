import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

import { type BlogPost, type BlogPostMeta, type BlogTexts } from "@/lib/blog-types"

export type { BlogPost, BlogPostMeta } from "@/lib/blog-types"
export { formatBlogDate } from "@/lib/blog-types"

const BLOG_DIR = path.join(process.cwd(), "content", "blog")

const EN_DIR = path.join(BLOG_DIR, "en")

function readFrontmatter(filename: string, dir: string = BLOG_DIR): { slug: string; data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(path.join(dir, filename), "utf-8")
  const { data, content } = matter(raw)
  return { slug: filename.replace(/\.md$/, ""), data, content }
}

/** Traduction anglaise d'un article : content/blog/en/<même-nom>.md (facultatif). */
function readEnglish(filename: string): (BlogTexts & { content: string }) | null {
  if (!fs.existsSync(path.join(EN_DIR, filename))) return null
  const { slug, data, content } = readFrontmatter(filename, EN_DIR)
  return {
    title: String(data.title ?? slug),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? ""),
    content,
  }
}

/** Liste tous les articles (métadonnées seulement), triés du plus récent au
 * plus ancien. Lit directement le dossier content/blog/ : ajouter un fichier
 * .md suffit, pas besoin de toucher au code.
 * ⚠️ Utilise node:fs — à n'appeler que depuis un composant serveur. */
export function getAllPosts(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .map((filename) => {
      const { slug, data } = readFrontmatter(filename)
      const en = readEnglish(filename)
      return {
        slug,
        title: String(data.title ?? slug),
        date: String(data.date ?? "1970-01-01"),
        excerpt: String(data.excerpt ?? ""),
        category: String(data.category ?? ""),
        en: en ? { title: en.title, excerpt: en.excerpt, category: en.category } : undefined,
      }
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}

/** ⚠️ Utilise node:fs — à n'appeler que depuis un composant serveur. */
export function getPostBySlug(slug: string): BlogPost | null {
  if (slug.toLowerCase() === "readme") return null
  const filename = `${slug}.md`
  if (!fs.existsSync(path.join(BLOG_DIR, filename))) return null
  const { data, content } = readFrontmatter(filename)
  const en = readEnglish(filename)
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? "1970-01-01"),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? ""),
    content,
    en: en ? { title: en.title, excerpt: en.excerpt, category: en.category } : undefined,
    enContent: en?.content,
  }
}
