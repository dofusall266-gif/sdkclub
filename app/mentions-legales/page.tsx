import type { Metadata } from "next"

import { PageLayout } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site Sudoku Club : éditeur, hébergement et propriété intellectuelle.",
  alternates: { canonical: "/mentions-legales" },
}

export default function LegalPage() {
  return (
    <PageLayout>
      <article className="max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Mentions légales</h1>
          <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : {new Date().getFullYear()}</p>
        </header>

        <Section title="Éditeur du site">
          <p>
            Le site Sudoku Club est un projet de jeu en ligne gratuit. Les informations relatives à l&apos;éditeur
            peuvent être obtenues via la page Contact.
          </p>
        </Section>

        <Section title="Hébergement">
          <p>
            Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.
          </p>
        </Section>

        <Section title="Propriété intellectuelle">
          <p>
            L&apos;ensemble des contenus présents sur ce site (textes, interface, code) est protégé par le droit de la
            propriété intellectuelle. Toute reproduction sans autorisation est interdite. Le sudoku, en tant que
            principe de jeu, appartient au domaine public.
          </p>
        </Section>

        <Section title="Responsabilité">
          <p>
            Sudoku Club s&apos;efforce d&apos;assurer l&apos;exactitude des informations et le bon fonctionnement du
            jeu, sans toutefois pouvoir le garantir en toutes circonstances. L&apos;utilisation du site se fait sous la
            seule responsabilité de l&apos;utilisateur.
          </p>
        </Section>
      </article>
    </PageLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
