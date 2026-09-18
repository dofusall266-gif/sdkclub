import { Check, Grid3x3, Rows3, Square } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Règles du sudoku — Comment jouer",
  description:
    "Apprenez les règles du sudoku en quelques minutes : le principe des lignes, colonnes et régions, et comment remplir la grille sans erreur.",
  alternates: { canonical: "/regles" },
}

const RULES = [
  {
    icon: Rows3,
    title: "Chaque ligne",
    text: "Chaque ligne horizontale doit contenir tous les chiffres de 1 à 9, sans aucune répétition.",
  },
  {
    icon: Grid3x3,
    title: "Chaque colonne",
    text: "Chaque colonne verticale doit elle aussi contenir les chiffres de 1 à 9, une seule fois chacun.",
  },
  {
    icon: Square,
    title: "Chaque région",
    text: "Les 9 régions de 3×3 cases doivent contenir tous les chiffres de 1 à 9 sans doublon.",
  },
]

export default function RulesPage() {
  return (
    <PageLayout>
      <article className="space-y-10">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Les règles du sudoku</h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Le sudoku est un jeu de logique qui se joue sur une grille de 81 cases, divisée en 9 régions de 9 cases.
            Le but&nbsp;: remplir toute la grille avec les chiffres de 1 à 9 en respectant trois règles simples.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {RULES.map((r) => (
            <div key={r.title} className="rounded-2xl border border-border bg-card p-6">
              <div className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                <r.icon className="size-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">{r.title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.text}</p>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Comment commencer une partie</h2>
          <ol className="space-y-3">
            {[
              "La grille de départ contient déjà quelques chiffres : ce sont les indices. Ils ne peuvent pas être modifiés.",
              "Cherchez les cases où un seul chiffre est possible en éliminant ceux déjà présents dans la ligne, la colonne et la région.",
              "Placez ce chiffre, puis répétez l'opération. Chaque chiffre placé en révèle de nouveaux.",
              "La grille est terminée lorsque les 81 cases sont remplies sans aucune répétition.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="rounded-2xl border border-border bg-secondary/40 p-6">
          <h2 className="text-xl font-bold">Bon à savoir</h2>
          <ul className="mt-4 space-y-2.5">
            {[
              "Une grille de sudoku bien conçue n'a qu'une seule solution.",
              "Il n'est jamais nécessaire de deviner : la logique suffit toujours.",
              "Utilisez les notes pour marquer les chiffres possibles dans une case.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">{tip}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/" className={buttonVariants({ size: "lg" })}>
            Jouer une grille
          </Link>
          <Link href="/techniques" className={buttonVariants({ variant: "outline", size: "lg" })}>
            Voir les techniques
          </Link>
        </div>
      </article>
    </PageLayout>
  )
}
