import type { Metadata } from "next"
import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Techniques et astuces de sudoku",
  description:
    "Progressez au sudoku grâce à des techniques éprouvées : candidat unique, paires nues, pointage, X-Wing et gestion des notes.",
  alternates: { canonical: "/techniques" },
}

const TECHNIQUES = [
  {
    level: "Débutant",
    title: "Le candidat unique",
    text: "Repérez les cases où un seul chiffre est possible. En balayant chaque ligne, colonne et région, vous éliminez les chiffres déjà placés jusqu'à ne laisser qu'une seule possibilité.",
  },
  {
    level: "Débutant",
    title: "Le dernier chiffre de la zone",
    text: "Lorsqu'une ligne, une colonne ou une région contient déjà 8 chiffres, la case restante ne peut accueillir que le chiffre manquant. C'est le placement le plus rapide.",
  },
  {
    level: "Intermédiaire",
    title: "Les paires nues",
    text: "Si deux cases d'une même zone ne peuvent contenir que les deux mêmes chiffres, ces chiffres leur sont réservés. Vous pouvez alors les éliminer des autres cases de la zone.",
  },
  {
    level: "Intermédiaire",
    title: "Le pointage",
    text: "Quand un chiffre candidat d'une région n'apparaît que sur une seule ligne ou colonne, il peut être supprimé du reste de cette ligne ou colonne, hors de la région.",
  },
  {
    level: "Avancé",
    title: "Le X-Wing",
    text: "Lorsqu'un chiffre candidat forme un rectangle sur deux lignes et deux colonnes, il peut être éliminé des autres cases de ces colonnes (ou lignes). Une technique redoutable pour les grilles expertes.",
  },
  {
    level: "Avancé",
    title: "La chaîne de couleurs",
    text: "Suivez les liens forts entre candidats identiques pour colorier la grille en deux teintes. Toute contradiction dans une couleur permet d'éliminer les candidats correspondants.",
  },
]

const LEVEL_STYLES: Record<string, string> = {
  Débutant: "bg-primary/12 text-primary",
  Intermédiaire: "bg-chart-4/20 text-chart-4",
  Avancé: "bg-destructive/12 text-destructive",
}

export default function TechniquesPage() {
  return (
    <PageLayout>
      <article className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Techniques et astuces</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Du placement le plus simple aux stratégies expertes, voici les méthodes qui vous feront progresser et
            résoudre des grilles de plus en plus difficiles.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          {TECHNIQUES.map((t) => (
            <div key={t.title} className="rounded-2xl border border-border bg-card p-6">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${LEVEL_STYLES[t.level]}`}
              >
                {t.level}
              </span>
              <h2 className="mt-3 text-lg font-semibold">{t.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{t.text}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-border bg-secondary/40 p-6">
          <h2 className="text-xl font-bold">La méthode des notes</h2>
          <p className="mt-3 text-muted-foreground">
            Sur les grilles difficiles, notez systématiquement les chiffres candidats dans chaque case vide. Au fil de
            vos placements, éliminez les candidats devenus impossibles&nbsp;: les techniques ci-dessus deviennent alors
            beaucoup plus faciles à repérer. Dans notre jeu, activez le mode «&nbsp;Notes&nbsp;» ou appuyez sur la
            touche «&nbsp;N&nbsp;».
          </p>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Mettre en pratique
          </Link>
          <Link href="/regles" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Revoir les règles
          </Link>
        </div>
      </article>
    </PageLayout>
  )
}
