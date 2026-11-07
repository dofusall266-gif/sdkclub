import { marked } from "marked"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { BlogPostContent } from "@/components/blog-post-content"
import { getPostBySlug } from "@/lib/blog"
import type { Locale } from "@/lib/i18n/dictionaries"
import { SITE_URL, localizeHtmlLinks, localizePath, pageAlternates } from "@/lib/i18n/paths"

/** Visuel de partage : « /blog/xxx.webp » (illustration) -> « /blog/og-xxx.jpg » (version 1200×630 pour les réseaux). */
const shareImage = (image: string) => image.replace("/blog/", "/blog/og-").replace(/\.(png|webp)$/, ".jpg")

/** Description de ~155 caractères max (au-delà, Google coupe l'extrait), coupée proprement à la fin d'une phrase ou d'un mot. */
function shortDescription(text: string, max = 155): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const sentence = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("? "), cut.lastIndexOf("! "))
  if (sentence > 80) return cut.slice(0, sentence + 1)
  return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:\s]+$/, "") + "…"
}

export function blogPostMetadata(slug: string, locale: Locale): Metadata {
  const post = getPostBySlug(slug)
  if (!post) return {}
  if (locale === "en" && !post.en) return {}
  const title = locale === "en" ? post.en!.title : (post.seoTitle ?? post.title)
  const excerpt = shortDescription(locale === "en" ? post.en!.excerpt : post.excerpt)
  return {
    title,
    description: excerpt,
    alternates: pageAlternates(`/blog/${post.slug}`, locale, { hasEnglish: !!post.en }),
    openGraph: {
      type: "article",
      locale: locale === "fr" ? "fr_FR" : "en_US",
      title,
      description: excerpt,
      publishedTime: post.date,
      ...(post.image ? { images: [{ url: shareImage(post.image), width: 1200, height: 630, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: excerpt,
      ...(post.image ? { images: [shareImage(post.image)] } : {}),
    },
  }
}

export function BlogPostView({ slug, locale }: { slug: string; locale: Locale }) {
  const post = getPostBySlug(slug)
  if (!post) notFound()
  if (locale === "en" && !(post.en && post.enContent)) notFound()

  const isEn = locale === "en"
  const texts = isEn ? post.en! : post
  const url = `${SITE_URL}${localizePath(`/blog/${post.slug}`, locale)}`
  const html = localizeHtmlLinks(marked.parse(isEn ? post.enContent! : post.content, { async: false }) as string, locale)

  // Données structurées (schema.org/BlogPosting) : aident Google (rich results)
  // et les moteurs de réponse basés sur l'IA à comprendre et citer l'article.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: texts.title,
    description: texts.excerpt,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: isEn ? "en" : "fr-FR",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Organization", name: "Sudoku-Club", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Sudoku-Club", url: SITE_URL },
    ...(texts.category ? { articleSection: texts.category } : {}),
    ...(post.image ? { image: `${SITE_URL}${shareImage(post.image)}` } : {}),
  }
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: isEn ? "Home" : "Accueil", item: `${SITE_URL}${localizePath("/", locale) === "/" ? "" : localizePath("/", locale)}` },
      { "@type": "ListItem", position: 2, name: isEn ? "Articles" : "Articles", item: `${SITE_URL}${localizePath("/blog", locale)}` },
      { "@type": "ListItem", position: 3, name: texts.title, item: url },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <BlogPostContent
        date={post.date}
        image={post.image}
        technique={post.technique}
        fr={{ title: texts.title, category: texts.category, html }}
      />
    </>
  )
}
