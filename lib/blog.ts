import fs from "node:fs"
import path from "node:path"

import matter from "gray-matter"

import { type BlogPost, type BlogPostMeta, type FaqItem } from "@/lib/blog-types"

export type { BlogPost, BlogPostMeta, FaqItem } from "@/lib/blog-types"
export { formatBlogDate, wrapTablesForScroll } from "@/lib/blog-types"

const BLOG_ROOT = path.join(process.cwd(), "content", "blog")

/** Le français (content/blog/fr/) est la langue de référence : c'est elle qui
 * définit la liste des articles qui existent. content/blog/en/ ne contient
 * que les traductions déjà faites — si un fichier anglais manque pour un
 * slug donné, on retombe silencieusement sur la version française plutôt
 * que de casser la page ou d'afficher un trou. */
export type BlogLocale = "fr" | "en"

function localeDir(locale: BlogLocale) {
  return path.join(BLOG_ROOT, locale)
}

function readFrontmatter(dir: string, filename: string): { slug: string; data: Record<string, unknown>; content: string } {
  const raw = fs.readFileSync(path.join(dir, filename), "utf-8")
  const { data, content } = matter(raw)
  return { slug: filename.replace(/\.md$/, ""), data, content }
}

function readFaq(data: Record<string, unknown>): FaqItem[] {
  const raw = data.faq
  if (!Array.isArray(raw)) return []
  return raw
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    .map((item) => ({ q: String(item.q ?? "").trim(), a: String(item.a ?? "").trim() }))
    .filter((item) => item.q && item.a)
}

/** Renvoie le dossier à lire pour ce slug/locale : la locale demandée si une
 * traduction existe, sinon le français. */
function resolveDir(locale: BlogLocale, filename: string): string {
  if (locale === "fr") return localeDir("fr")
  const enPath = path.join(localeDir("en"), filename)
  return fs.existsSync(enPath) ? localeDir("en") : localeDir("fr")
}

/** Liste tous les articles (métadonnées seulement) dans la locale demandée,
 * triés du plus récent au plus ancien. Ajouter un fichier .md dans
 * content/blog/fr/ suffit à publier un nouvel article, pas besoin de toucher
 * au code — l'ajouter aussi dans content/blog/en/ est optionnel.
 * ⚠️ Utilise node:fs — à n'appeler que depuis un composant serveur. */
export function getAllPosts(locale: BlogLocale = "fr"): BlogPostMeta[] {
  const frDir = localeDir("fr")
  if (!fs.existsSync(frDir)) return []
  return fs
    .readdirSync(frDir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .map((filename) => {
      const { slug, data } = readFrontmatter(resolveDir(locale, filename), filename)
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

/** ⚠️ Utilise node:fs — à n'appeler que depuis un composant serveur. */
export function getPostBySlug(slug: string, locale: BlogLocale = "fr"): BlogPost | null {
  if (slug.toLowerCase() === "readme") return null
  const filename = `${slug}.md`
  if (!fs.existsSync(path.join(localeDir("fr"), filename))) return null
  const { data, content } = readFrontmatter(resolveDir(locale, filename), filename)
  return {
    slug,
    title: String(data.title ?? slug),
    date: String(data.date ?? "1970-01-01"),
    excerpt: String(data.excerpt ?? ""),
    category: String(data.category ?? ""),
    faq: readFaq(data),
    content,
  }
}
