"use client"

import Link from "next/link"

import type { BlogPostMeta } from "@/lib/blog-types"
import { formatBlogDate } from "@/lib/blog-types"
import { useLanguage } from "@/lib/i18n/context"

/** Liste des articles sur /blog, dans la langue choisie — même principe que
 * BlogPostBody : les deux jeux de métadonnées (fr/en) sont préparés côté
 * serveur, le choix se fait ici selon la préférence de langue. */
export function BlogIndexList({ fr, en }: { fr: BlogPostMeta[]; en: BlogPostMeta[] }) {
  const { t, locale } = useLanguage()
  const posts = locale === "en" ? en : fr

  return (
    <>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{t.blog.heading}</h1>
        <p className="mt-3 text-lg text-muted-foreground">{t.blog.subheading}</p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">{t.blog.empty}</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              {post.category && (
                <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {post.category}
                </span>
              )}
              <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">{post.title}</h2>
              <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
              <time dateTime={post.date} className="mt-1 text-xs text-muted-foreground">
                {formatBlogDate(post.date, locale)}
              </time>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
