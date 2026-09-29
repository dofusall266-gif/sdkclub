"use client"

import Link from "next/link"

import { FaqSection } from "@/components/faq-section"
import type { FaqItem } from "@/lib/blog-types"
import { formatBlogDate } from "@/lib/blog-types"
import { useLanguage } from "@/lib/i18n/context"

export interface BlogPostLocaleData {
  title: string
  date: string
  category: string
  html: string
  faq: FaqItem[]
}

/** Rendu client de l'article : reçoit les deux versions (fr/en) déjà
 * converties en HTML côté serveur, et affiche celle qui correspond à la
 * langue choisie — même mécanisme que le reste du site (bascule FR/EN
 * instantanée, sans rechargement de page, langue par défaut = français). */
export function BlogPostBody({ fr, en }: { fr: BlogPostLocaleData; en: BlogPostLocaleData }) {
  const { t, locale } = useLanguage()
  const post = locale === "en" ? en : fr

  return (
    <article className="mx-auto max-w-[42rem]">
      <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
        {t.blog.back}
      </Link>

      <header className="mt-4 mb-8">
        {post.category && (
          <span className="mb-3 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            {post.category}
          </span>
        )}
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
        <time dateTime={post.date} className="mt-3 block text-sm text-muted-foreground">
          {t.blog.publishedOn} {formatBlogDate(post.date, locale)}
        </time>
      </header>

      <div className="md-content" dangerouslySetInnerHTML={{ __html: post.html }} />

      <FaqSection heading={t.blog.faqHeading} items={post.faq} />
    </article>
  )
}
