import type { Metadata } from "next"
import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { getAllPosts, formatBlogDate } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog — Histoire, techniques et bienfaits du sudoku",
  description:
    "Articles sur l'histoire du sudoku, ses techniques de résolution avancées (X-Wing, Swordfish...) et ses bienfaits pour le cerveau.",
  alternates: { canonical: "/blog" },
}

export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <PageLayout>
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Blog</h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Histoire du sudoku, techniques de résolution avancées et bienfaits sur le cerveau.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-muted-foreground">Aucun article publié pour le moment.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              {post.category && (
                <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {post.category}
                </span>
              )}
              <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">{post.title}</h2>
              <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>
              <time dateTime={post.date} className="mt-1 text-xs text-muted-foreground">
                {formatBlogDate(post.date, "fr")}
              </time>
            </Link>
          ))}
        </div>
      )}
    </PageLayout>
  )
}
