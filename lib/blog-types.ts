// Types et utilitaires purs (sans accès disque), pour pouvoir les importer
// depuis des composants client sans jamais entraîner node:fs dans le bundle
// navigateur. Les fonctions qui lisent réellement les fichiers vivent dans
// lib/blog.ts (composants serveur uniquement).

export interface BlogPostMeta {
  slug: string
  title: string
  date: string // YYYY-MM-DD
  excerpt: string
  category: string
}

export interface FaqItem {
  q: string
  a: string
}

export interface BlogPost extends BlogPostMeta {
  content: string
  /** Questions/réponses déclarées dans le frontmatter (champ `faq:`), affichées
   * à part du corps de l'article plutôt qu'au fil du texte. */
  faq: FaqItem[]
}

/** Enrobe chaque <table> générée par le markdown dans un conteneur scrollable
 * horizontalement, pour ne jamais casser la mise en page sur mobile. */
export function wrapTablesForScroll(html: string): string {
  return html.replace(/<table>/g, '<div class="table-scroll"><table>').replace(/<\/table>/g, "</table></div>")
}

export function formatBlogDate(dateStr: string, locale: "fr" | "en"): string {
  const d = new Date(`${dateStr}T00:00:00Z`)
  if (Number.isNaN(d.getTime())) return dateStr
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(d)
}
