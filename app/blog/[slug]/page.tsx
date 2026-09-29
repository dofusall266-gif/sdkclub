import { marked } from "marked"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BlogPostBody, type BlogPostLocaleData } from "@/components/blog-post-body"
import { PageLayout } from "@/components/page-layout"
import { getAllPosts, getPostBySlug, wrapTablesForScroll, type BlogPost } from "@/lib/blog"

export function generateStaticParams() {
  return getAllPosts("fr").map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  // Les métadonnées (balises <head>, aperçus de partage) restent en français,
  // langue par défaut du rendu serveur — cohérent avec le reste du site, qui
  // ne bascule qu'après hydratation côté client selon la préférence stockée.
  const post = getPostBySlug(slug, "fr")
  if (!post) return {}
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.date },
  }
}

const SITE_URL = "https://sudoku-club.com"

function toLocaleData(post: BlogPost): BlogPostLocaleData {
  const html = wrapTablesForScroll(marked.parse(post.content, { async: false }) as string)
  return { title: post.title, date: post.date, category: post.category, html, faq: post.faq }
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const postFr = getPostBySlug(slug, "fr")
  if (!postFr) notFound()
  const postEn = getPostBySlug(slug, "en") ?? postFr

  // Données structurées (schema.org) : aident Google (rich results) et les
  // moteurs de réponse basés sur l'IA (ChatGPT, Perplexity, AI Overviews...)
  // à comprendre et citer correctement l'article — invisible pour le
  // lecteur. Générées à partir de la version française (langue de rendu par
  // défaut), FAQPage incluse si l'article a des questions fréquentes.
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: postFr.title,
    description: postFr.excerpt,
    datePublished: postFr.date,
    dateModified: postFr.date,
    inLanguage: "fr-FR",
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${postFr.slug}` },
    author: { "@type": "Organization", name: "Sudoku Club", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Sudoku Club", url: SITE_URL },
    ...(postFr.category ? { articleSection: postFr.category } : {}),
  }
  const faqJsonLd =
    postFr.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: postFr.faq.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }
      : null

  return (
    <PageLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {faqJsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />}
      <BlogPostBody fr={toLocaleData(postFr)} en={toLocaleData(postEn)} />
    </PageLayout>
  )
}
