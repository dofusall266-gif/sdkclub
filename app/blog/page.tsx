import type { Metadata } from "next"

import { BlogIndexContent } from "@/components/blog-index-content"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Articles — Histoire, techniques et bienfaits du sudoku",
  description:
    "Articles sur l'histoire du sudoku, ses techniques de résolution avancées (X-Wing, Swordfish...) et ses bienfaits pour le cerveau.",
  alternates: { canonical: "/blog" },
}

export default function BlogIndexPage() {
  return <BlogIndexContent posts={getAllPosts()} />
}
