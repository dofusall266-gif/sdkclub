import { marked } from "marked"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BlogPostContent } from "@/components/blog-post-content"
import { getAllPosts, getPostBySlug } from "@/lib/blog"

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

const SITE_URL = "https://sudoku-club.com"

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const html = marked.parse(post.content, { async: false }) as string
  const enHtml = post.enContent ? (marked.parse(post.enContent, { async: false }) as string) : null

  // Données structurées (schema.org/BlogPosting) : aident Google (rich results)
  // et les moteurs de réponse basés sur l'IA (ChatGPT, Perplexity, AI Overviews...)
  // à comprendre et citer correctement l'article — invisible pour le lecteur.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "fr-FR",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${post.slug}` },
    author: { "@type": "Organization", name: "Sudoku Club", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Sudoku Club", url: SITE_URL },
    ...(post.category ? { articleSection: post.category } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPostContent
        date={post.date}
        fr={{ title: post.title, category: post.category, html }}
        en={post.en && enHtml ? { title: post.en.title, category: post.en.category, html: enHtml } : undefined}
      />
    </>
  )
}
