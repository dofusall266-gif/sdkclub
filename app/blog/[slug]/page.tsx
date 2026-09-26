import { marked } from "marked"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { PageLayout } from "@/components/page-layout"
import { formatBlogDate, getAllPosts, getPostBySlug } from "@/lib/blog"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date },
  }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const html = marked.parse(post.content, { async: false }) as string

  return (
    <PageLayout>
      <article className="mx-auto max-w-[42rem]">
        <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
          ← Retour au blog
        </Link>

        <header className="mt-4 mb-8">
          {post.category && (
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {post.category}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
          <time dateTime={post.date} className="mt-3 block text-sm text-muted-foreground">
            Publié le {formatBlogDate(post.date, "fr")}
          </time>
        </header>

        <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </PageLayout>
  )
}
