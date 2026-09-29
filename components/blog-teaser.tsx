"use client"

import { ArrowRight } from "lucide-react"
import Link from "next/link"

import type { BlogPostMeta } from "@/lib/blog-types"
import { formatBlogDate } from "@/lib/blog-types"
import { useLanguage } from "@/lib/i18n/context"

/** Bloc "à lire aussi" en bas de l'accueil : donne un accès direct aux
 * articles depuis la page la plus visitée du site, plutôt que de compter
 * uniquement sur le lien du menu. Les deux jeux de métadonnées (fr/en) sont
 * préparés côté serveur ; le choix se fait ici selon la langue active. */
export function BlogTeaser({ fr, en }: { fr: BlogPostMeta[]; en: BlogPostMeta[] }) {
  const { t, locale } = useLanguage()
  const posts = locale === "en" ? en : fr
  if (posts.length === 0) return null

  return (
    <section className="mx-auto mt-14 w-full max-w-[58rem]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold">{t.home.articlesHeading}</h2>
        <Link href="/blog" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          {t.home.articlesSeeAll} <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col gap-1.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            {post.category && (
              <span className="w-fit rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
                {post.category}
              </span>
            )}
            <h3 className="text-sm font-semibold leading-snug group-hover:text-primary">{post.title}</h3>
            <time dateTime={post.date} className="mt-auto pt-1 text-xs text-muted-foreground">
              {formatBlogDate(post.date, locale)}
            </time>
          </Link>
        ))}
      </div>
    </section>
  )
}
