import type { Metadata } from "next"

import { BlogIndexContent } from "@/components/blog-index-content"
import { getAllPosts } from "@/lib/blog"
import { pageAlternates } from "@/lib/i18n/paths"

export const metadata: Metadata = {
  title: "Sudoku articles: history and techniques",
  description:
    "Articles on the history of Sudoku, advanced solving techniques (X-Wing, Swordfish…) and its benefits for the brain.",
  alternates: pageAlternates("/blog", "en"),
}

export default function Page() {
  return <BlogIndexContent posts={getAllPosts()} />
}
