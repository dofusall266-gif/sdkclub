"use client"

import Link from "next/link"

import { useLanguage } from "@/lib/i18n/context"

/**
 * Texte de la page d'accueil (sous le jeu) : c'est ce que Google lit pour comprendre la page,
 * puisque le plateau de jeu lui-même est affiché côté navigateur. Rendu côté serveur en français ;
 * la version anglaise s'affiche quand le visiteur change de langue.
 */
const CONTENT = {
  fr: {
    h1: "Sudoku gratuit en ligne",
    lead: "Jouez au sudoku gratuitement, sans inscription et sans téléchargement : des grilles illimitées, vérifiées à solution unique, sur ordinateur, tablette et téléphone.",
    levelsTitle: "Six niveaux, du Facile au Fou",
    levels:
      "Choisissez votre niveau : Facile pour découvrir, Moyen et Difficile pour progresser, Expert, Diabolique et Fou pour les grilles qui demandent des techniques avancées comme le X-Wing ou le Swordfish. Chaque grille est notée sur 100 pour que vous sachiez à quoi vous attendre.",
    featuresTitle: "Ce que vous trouverez sur Sudoku-Club",
    features: [
      { name: "Le défi du jour", text: "une grille par jour, la même pour tout le monde, avec un classement.", href: "/defi" },
      { name: "L'impression en PDF", text: "des grilles à imprimer, avec ou sans solution, pour jouer au crayon.", href: undefined },
      { name: "Les notes (candidats)", text: "annotez les cases comme sur papier pour repérer les motifs.", href: undefined },
      { name: "Des leçons et des exercices", text: "apprenez les techniques pas à pas, sur de vraies situations de grille.", href: "/techniques" },
    ],
    howTitle: "Comment jouer au sudoku ?",
    how: "Remplissez la grille de 9×9 cases avec les chiffres de 1 à 9 : chaque ligne, chaque colonne et chaque bloc de 3×3 doit contenir tous les chiffres une seule fois. Si vous débutez, lisez d'abord",
    howLink: "les règles du sudoku",
    howEnd: "puis découvrez les techniques de résolution.",
    faqTitle: "Questions fréquentes",
    faq: [
      { q: "Le sudoku est-il vraiment gratuit ?", a: "Oui. Toutes les grilles, tous les niveaux et le défi du jour sont gratuits, sans compte à créer ni paiement pour débloquer un niveau." },
      { q: "Chaque grille a-t-elle une solution unique ?", a: "Oui. Les grilles sont vérifiées : elles se résolvent par la logique seule, sans avoir besoin de deviner." },
      { q: "Mes statistiques sont-elles enregistrées ?", a: "Votre meilleur temps et votre série restent sur votre appareil. Rien n'est envoyé tant que vous ne participez pas au classement du défi du jour." },
      { q: "Peut-on imprimer une grille ?", a: "Oui : le bouton d'impression génère un PDF, avec ou sans la solution." },
    ],
  },
  en: {
    h1: "Free online Sudoku",
    lead: "Play Sudoku for free, with no sign-up and no download: unlimited puzzles, each checked for a unique solution, on desktop, tablet and phone.",
    levelsTitle: "Six levels, from Easy to Crazy",
    levels:
      "Pick your level: Easy to get started, Medium and Hard to improve, Expert, Diabolical and Crazy for puzzles that need advanced techniques such as the X-Wing or the Swordfish. Every puzzle is rated out of 100 so you know what to expect.",
    featuresTitle: "What you will find on Sudoku-Club",
    features: [
      { name: "The daily challenge", text: "one puzzle a day, the same for everyone, with a leaderboard.", href: "/defi" },
      { name: "PDF printing", text: "printable puzzles, with or without the solution, to play with a pencil.", href: undefined },
      { name: "Notes (candidates)", text: "pencil in the cells as on paper to spot patterns.", href: undefined },
      { name: "Lessons and exercises", text: "learn the techniques step by step, on real grid situations.", href: "/techniques" },
    ],
    howTitle: "How do you play Sudoku?",
    how: "Fill the 9×9 grid with the digits 1 to 9: every row, every column and every 3×3 box must contain each digit exactly once. If you are new, start with",
    howLink: "the rules of Sudoku",
    howEnd: "then explore the solving techniques.",
    faqTitle: "Frequently asked questions",
    faq: [
      { q: "Is Sudoku really free?", a: "Yes. Every puzzle, every level and the daily challenge are free, with no account to create and nothing to pay to unlock a level." },
      { q: "Does every puzzle have a unique solution?", a: "Yes. Puzzles are checked: they can be solved by logic alone, with no guessing." },
      { q: "Are my statistics saved?", a: "Your best time and streak stay on your device. Nothing is sent unless you join the daily challenge leaderboard." },
      { q: "Can I print a puzzle?", a: "Yes: the print button generates a PDF, with or without the solution." },
    ],
  },
} as const

export function HomeSeoContent() {
  const { locale } = useLanguage()
  const c = CONTENT[locale]
  return (
    <section className="mt-12 space-y-8 border-t border-border pt-8" aria-labelledby="home-h1">
      <header>
        <h1 id="home-h1" className="text-2xl font-bold tracking-tight sm:text-3xl">
          {c.h1}
        </h1>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">{c.lead}</p>
      </header>

      <div>
        <h2 className="text-xl font-bold">{c.levelsTitle}</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">{c.levels}</p>
      </div>

      <div>
        <h2 className="text-xl font-bold">{c.featuresTitle}</h2>
        <ul className="mt-2 space-y-1.5 text-muted-foreground">
          {c.features.map((f) => (
            <li key={f.name}>
              {f.href ? (
                <Link href={f.href} className="font-semibold text-foreground underline-offset-4 hover:underline">
                  {f.name}
                </Link>
              ) : (
                <span className="font-semibold text-foreground">{f.name}</span>
              )}{" "}
              : {f.text}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-xl font-bold">{c.howTitle}</h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
          {c.how}{" "}
          <Link href="/regles" className="font-semibold text-foreground underline-offset-4 hover:underline">
            {c.howLink}
          </Link>
          , {c.howEnd}
        </p>
      </div>

      <div>
        <h2 className="text-xl font-bold">{c.faqTitle}</h2>
        <div className="mt-3 space-y-4">
          {c.faq.map((f) => (
            <div key={f.q}>
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
