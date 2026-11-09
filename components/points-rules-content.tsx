"use client"

import Link from "@/components/localized-link"

import { PageLayout } from "@/components/page-layout"
import { buttonVariants } from "@/components/ui/button"
import { useLanguage } from "@/lib/i18n/context"
import { COMBO_TIERS, LEVEL_POINTS, REFERENCE_SECONDS } from "@/lib/scoring"
import { DIFFICULTIES } from "@/lib/sudoku"

const fmtTime = (s: number) => `${Math.round(s / 60)} min`

const TEXT = {
  fr: {
    h1: "Règles des points",
    lead: "Chaque grille libre te rapporte des points. Plus le niveau est difficile, plus ils sont élevés, et enchaîner les bonnes réponses les fait grimper. Voici comment tout est calculé.",
    casesTitle: "Chaque case juste rapporte des points",
    cases: "À chaque bon chiffre posé, tu gagnes les points de ton niveau, multipliés par ton combo du moment. Les points d’un niveau se lisent dans le tableau ci-dessous, avec le temps de référence utilisé pour le bonus de temps.",
    level: "Niveau",
    perCell: "Points par case",
    ref: "Temps de référence",
    comboTitle: "Le combo : les bonnes réponses d’affilée",
    combo: "Plus tu enchaînes de bonnes réponses sans te tromper, plus le multiplicateur grimpe. Il change à 3, 7, 10 et 20 bonnes réponses d’affilée, et sa valeur exacte est tirée au hasard dans une fourchette, différente à chaque grille. Une erreur remet le combo à zéro, mais ne te retire aucun point.",
    streak: "Bonnes réponses d’affilée",
    mult: "Multiplicateur",
    between: (a: number, b: number) => `entre ×${a} et ×${b}`,
    timeTitle: "Le bonus de temps",
    time: "Plus tu termines vite par rapport au temps de référence de ton niveau, plus le bonus est grand : jusqu’à +50 % des points de base des cases. Il diminue régulièrement et tombe à 0 quand tu atteins le temps de référence.",
    flawlessTitle: "Partie sans faute",
    flawless: "Si tu termines la grille sans aucune erreur, tes points (cases, combos et bonus de temps) sont augmentés de 25 %. Avec au moins une erreur, ce bonus vaut 0.",
    dailyTitle: "Le défi du jour",
    daily: "Le défi du jour rapporte aussi des points, avec les mêmes règles, plus un bonus de 20 % sur le total. Comme il n’y a qu’une grille par jour, tu ne peux marquer des points qu’une seule fois par défi.",
    fairTitle: "Ce qui ne rapporte rien",
    fair: "Une case ne rapporte qu’une fois : l’effacer puis la retaper ne donne pas de points en plus. Un indice ne rapporte rien non plus, et ne casse pas ton combo.",
    boardTitle: "Le classement",
    board: "Le classement général additionne tes points sur la période : aujourd’hui, cette semaine (du lundi au dimanche), ce mois ou depuis toujours. Les jours, semaines et mois sont comptés en heure UTC. Il est ouvert à tous : pas de compte, un simple pseudo à la fin d’une partie suffit.",
    seeBoard: "Voir le classement",
    play: "Jouer",
  },
  en: {
    h1: "How points work",
    lead: "Every free puzzle earns you points. The harder the level, the more points you get, and chaining correct answers makes them climb. Here is how everything is calculated.",
    casesTitle: "Every correct cell earns points",
    cases: "Each time you place a correct digit, you earn your level’s points, multiplied by your current combo. Points per level are in the table below, along with the reference time used for the time bonus.",
    level: "Level",
    perCell: "Points per cell",
    ref: "Reference time",
    comboTitle: "The combo: correct answers in a row",
    combo: "The more correct answers you chain without a mistake, the higher the multiplier goes. It changes at 3, 7, 10 and 20 correct answers in a row, and its exact value is drawn at random within a range, different for each puzzle. A mistake resets the combo to zero, but never takes points away.",
    streak: "Correct answers in a row",
    mult: "Multiplier",
    between: (a: number, b: number) => `between ×${a} and ×${b}`,
    timeTitle: "The time bonus",
    time: "The faster you finish compared to your level’s reference time, the bigger the bonus: up to +50% of the cells’ base points. It decreases steadily and drops to 0 when you reach the reference time.",
    flawlessTitle: "Flawless game",
    flawless: "If you finish the puzzle with no mistake at all, your points (cells, combos and time bonus) are increased by 25%. With at least one mistake, this bonus is 0.",
    dailyTitle: "The daily challenge",
    daily: "The daily challenge also earns points, with the same rules plus a 20% bonus on the total. As there is only one puzzle a day, you can only score once per challenge.",
    fairTitle: "What earns nothing",
    fair: "A cell only earns points once: erasing it and typing it again gives nothing extra. A hint earns nothing either, and does not break your combo.",
    boardTitle: "The leaderboard",
    board: "The overall leaderboard adds up your points over the period: today, this week (Monday to Sunday), this month or all time. Days, weeks and months are counted in UTC. It is open to everyone: no account, just a nickname at the end of a game.",
    seeBoard: "See the leaderboard",
    play: "Play",
  },
} as const

export function PointsRulesContent() {
  const { locale, t } = useLanguage()
  const x = TEXT[locale]
  const num = (n: number) => n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")
  return (
    <PageLayout>
      <article className="mx-auto max-w-[42rem]">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{x.h1}</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">{x.lead}</p>

        <h2 className="mt-8 text-xl font-bold">{x.casesTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{x.cases}</p>
        <div className="mt-3 overflow-hidden rounded-xl border border-border text-sm">
          <div className="grid grid-cols-3 bg-secondary/60 px-4 py-2 font-semibold">
            <span>{x.level}</span>
            <span>{x.perCell}</span>
            <span>{x.ref}</span>
          </div>
          {DIFFICULTIES.map((d) => (
            <div key={d} className="grid grid-cols-3 border-t border-border px-4 py-2">
              <span>{t.game.difficulties[d]}</span>
              <span className="tabular-nums">{LEVEL_POINTS[d]}</span>
              <span className="tabular-nums">{fmtTime(REFERENCE_SECONDS[d])}</span>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-xl font-bold">{x.comboTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{x.combo}</p>
        <div className="mt-3 overflow-hidden rounded-xl border border-border text-sm">
          <div className="grid grid-cols-2 bg-secondary/60 px-4 py-2 font-semibold">
            <span>{x.streak}</span>
            <span>{x.mult}</span>
          </div>
          {COMBO_TIERS.map((tier) => (
            <div key={tier.at} className="grid grid-cols-2 border-t border-border px-4 py-2">
              <span className="tabular-nums">{tier.at}</span>
              <span className="tabular-nums">
                {x.between(
                  Number(tier.min.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")) || tier.min,
                  tier.max,
                ).replace(/\./g, locale === "fr" ? "," : ".")}
              </span>
            </div>
          ))}
        </div>

        <h2 className="mt-8 text-xl font-bold">{x.timeTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{x.time}</p>

        <h2 className="mt-8 text-xl font-bold">{x.flawlessTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{x.flawless}</p>

        <h2 className="mt-8 text-xl font-bold">{x.dailyTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{x.daily}</p>

        <h2 className="mt-8 text-xl font-bold">{x.fairTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{x.fair}</p>

        <h2 className="mt-8 text-xl font-bold">{x.boardTitle}</h2>
        <p className="mt-2 leading-relaxed text-muted-foreground">{x.board}</p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/classement" className={buttonVariants({ size: "lg" })}>
            {x.seeBoard}
          </Link>
          <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>
            {x.play}
          </Link>
        </div>
        <p className="sr-only">{num(0)}</p>
      </article>
    </PageLayout>
  )
}
