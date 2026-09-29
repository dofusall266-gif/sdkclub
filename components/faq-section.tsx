import { ChevronDown } from "lucide-react"

import type { FaqItem } from "@/lib/blog-types"

/** Encadré "Questions fréquentes" affiché À PART du corps de l'article
 * (jamais mélangé au texte qui coule), en accordéon repliable. Les données
 * viennent du frontmatter `faq:` de chaque fichier markdown — voir lib/blog.ts. */
export function FaqSection({ heading, items }: { heading: string; items: FaqItem[] }) {
  if (items.length === 0) return null

  return (
    <section className="mt-14 rounded-2xl border border-border bg-secondary/30 p-6 sm:p-8">
      <h2 className="text-xl font-bold tracking-tight">{heading}</h2>
      <div className="mt-3 divide-y divide-border">
        {items.map((item) => (
          <details key={item.q} className="group py-3.5 first:pt-0 last:pb-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
              <span>{item.q}</span>
              <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
