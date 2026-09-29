import type { Metadata } from "next"

import { BlogIndexList } from "@/components/blog-index-list"
import { PageLayout } from "@/components/page-layout"
import { getAllPosts } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Articles — Histoire, techniques et bienfaits du sudoku",
  description:
    "Articles sur l'histoire du sudoku, ses techniques de résolution avancées (X-Wing, Swordfish...) et ses bienfaits pour le cerveau.",
  alternates: { canonical: "/blog" },
}

export default function BlogIndexPage() {
  const postsFr = getAllPosts("fr")
  const postsEn = getAllPosts("en")

  return (
    <PageLayout>
      <BlogIndexList fr={postsFr} en={postsEn} />
    </PageLayout>
  )
}
