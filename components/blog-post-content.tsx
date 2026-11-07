"use client"

import Link from "@/components/localized-link"

import { PageLayout } from "@/components/page-layout"
import { formatBlogDate } from "@/lib/blog-types"
import { LESSONS, type TechSlug } from "@/lib/training-lessons"
import { useLanguage } from "@/lib/i18n/context"

interface Version {
  title: string
  category: string
  html: string
}

/** Affiche l'article dans la langue choisie (repli sur le français si pas de
 * traduction). Le HTML est produit côté serveur ; ici on ne fait que choisir. */
export function BlogPostContent({
  date,
  fr,
  en,
  image,
  technique,
}: {
  date: string
  fr: Version
  en?: Version
  image?: string
  technique?: string
}) {
  const { t, locale } = useLanguage()
  const v = locale === "en" && en ? en : fr
  const lesson = technique && technique in LESSONS ? LESSONS[technique as TechSlug] : null

  const callout = lesson && (
    <Link
      href={`/techniques/${lesson.slug}`}
      className="group block rounded-2xl border border-primary/30 bg-primary/5 p-5 transition-colors hover:border-primary/60"
    >
      <p className="text-sm font-semibold text-primary">{t.training.calloutTitle(lesson[locale].name)}</p>
      <p className="mt-1 text-sm text-muted-foreground">{t.training.calloutText}</p>
      <span className="mt-3 inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground">
        {t.training.practiceCta} →
      </span>
    </Link>
  )

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

        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={v.title}
            width={1200}
            height={630}
            fetchPriority="high"
            className="mb-8 w-full rounded-2xl border border-border"
          />
        )}

        {callout && <div className="mb-8">{callout}</div>}

        <div className="md-content" dangerouslySetInnerHTML={{ __html: v.html }} />

        {callout && <div className="mt-10">{callout}</div>}
      </article>
    </PageLayout>
  )
}
