import type { Metadata } from "next"

import { BlogPostView, blogPostMetadata } from "@/components/blog-post-view"
import { getAllPosts } from "@/lib/blog"

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  return blogPostMetadata(slug, "fr")
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <BlogPostView slug={slug} locale="fr" />
}
