import type { Metadata } from "next"

import { pageAlternates } from "@/lib/i18n/paths"
import { BlogIndexContent } from "@/components/blog-index-content"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Articles sur le sudoku : histoire et techniques",
  description:
    "Articles sur l'histoire du sudoku, ses techniques de résolution avancées (X-Wing, Swordfish...) et ses bienfaits pour le cerveau.",
  alternates: pageAlternates("/blog", "fr"),
}

export default function BlogIndexPage() {
  return <BlogIndexContent posts={getAllPosts()} />
}
