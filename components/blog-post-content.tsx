"use client"

import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { formatBlogDate } from "@/lib/blog-types"
import { useLanguage } from "@/lib/i18n/context"

interface Version {
  title: string
  category: string
  html: string
}

/** Affiche l'article dans la langue choisie (repli sur le français si pas de
 * traduction). Le HTML est produit côté serveur ; ici on ne fait que choisir. */
export function BlogPostContent({ date, fr, en }: { date: string; fr: Version; en?: Version }) {
  const { t, locale } = useLanguage()
  const v = locale === "en" && en ? en : fr

  return (
    <PageLayout>
      <article className="mx-auto max-w-[42rem]">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          {t.blog.back}
        </Link>

        <header className="mt-4 mb-8">
          {v.category && (
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {v.category}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{v.title}</h1>
          <time dateTime={date} className="mt-3 block text-sm text-muted-foreground">
            {t.blog.publishedOn} {formatBlogDate(date, locale)}
          </time>
        </header>

        <div className="md-content" dangerouslySetInnerHTML={{ __html: v.html }} />
      </article>
    </PageLayout>
  )
}
