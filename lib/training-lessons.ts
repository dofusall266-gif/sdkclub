import type { TrainingTech } from "@/lib/training"

export type TechSlug = "x-wing" | "y-wing" | "swordfish"

export const TECH_SLUGS: TechSlug[] = ["x-wing", "y-wing", "swordfish"]

export interface LessonText {
  name: string
  tagline: string
  /** Une phrase pour les cartes et les moteurs de recherche. */
  summary: string
  intro: string
  steps: { title: string; text: string }[]
  mistakes: string[]
  faq: { q: string; a: string }[]
  /** Consigne de l'exercice. */
  task: string
}

export interface Lesson {
  slug: TechSlug
  /** Illustration (public/blog/…), remplaçable par une image à vous : mêmes nom et dimensions (1200×630). */
  art: string
  artAlt: { fr: string; en: string }
  tech: TrainingTech
  /** Article de blog associé, s'il existe. */
  article?: string
  /** Titre et description de la page (français, pour Google). */
  metaTitle: string
  metaDescription: string
  fr: LessonText
  en: LessonText
}

export const LESSONS: Record<TechSlug, Lesson> = {
  "x-wing": {
    slug: "x-wing",
    tech: "x_wing",
    art: "/blog/technique-x-wing.png",
    artAlt: { fr: "Illustration du X-Wing : quatre cases reliées en X", en: "X-Wing illustration: four cells linked in an X" },
    article: "technique-x-wing",
    metaTitle: "La technique X-Wing au sudoku : explication visuelle et exercices",
    metaDescription:
      "Comprenez le X-Wing au sudoku avec un exemple illustré, puis entraînez-vous sur de vraies grilles : repérez le rectangle et éliminez les candidats.",
    fr: {
      name: "X-Wing",
      tagline: "Un rectangle de quatre cases qui permet d'éliminer des candidats ailleurs dans la grille.",
      summary: "Quatre cases en rectangle sur un même chiffre : une élimination qui débloque les grilles difficiles.",
      intro:
        "Le X-Wing s'applique à un seul chiffre à la fois. Dans deux lignes, ce chiffre n'a chacun que deux places possibles, et ces places sont dans les mêmes deux colonnes. Elles dessinent un rectangle : les deux chiffres iront forcément sur deux coins opposés.",
      steps: [
        { title: "Choisis un chiffre et affiche les notes", text: "Le X-Wing se cherche sur un chiffre à la fois, sur une grille où les notes (candidats) sont remplies." },
        { title: "Cherche deux lignes à deux places", text: "Repère deux lignes où ce chiffre n'a que deux emplacements possibles — et où ces emplacements sont dans les mêmes colonnes." },
        { title: "Le rectangle est formé", text: "Les quatre cases forment un rectangle. Que le chiffre aille sur une diagonale ou l'autre, chacune des deux colonnes aura son chiffre dans une de ces deux lignes." },
        { title: "Élimine ailleurs", text: "Dans ces deux colonnes, le chiffre ne peut plus être dans les autres lignes : tu peux le retirer des autres cases de ces colonnes." },
      ],
      mistakes: [
        "Prendre deux lignes dont les emplacements ne tombent pas exactement dans les mêmes colonnes : ce n'est pas un X-Wing.",
        "Oublier qu'il faut des lignes avec exactement deux places pour le chiffre (pas trois).",
        "Chercher sans les notes : le motif ne se voit que sur les candidats.",
      ],
      faq: [
        { q: "Le X-Wing peut-il se faire avec des colonnes ?", a: "Oui : c'est le même raisonnement tourné de 90°. Deux colonnes où le chiffre a deux places, dans les mêmes lignes, permettent d'éliminer le chiffre ailleurs dans ces lignes." },
        { q: "À quel niveau le rencontre-t-on ?", a: "Surtout à partir du niveau Expert. Une grille Facile ou Moyenne n'en demande presque jamais." },
        { q: "Et si je ne vois pas de X-Wing ?", a: "Passe à un autre chiffre, ou essaie le Y-Wing. Beaucoup de grilles n'en contiennent pas." },
      ],
      task: "Trouve le X-Wing : sélectionne les 4 cases qui forment le rectangle.",
    },
    en: {
      name: "X-Wing",
      tagline: "A four-cell rectangle that lets you eliminate candidates elsewhere in the grid.",
      summary: "Four cells in a rectangle on one digit: an elimination that unlocks hard puzzles.",
      intro:
        "The X-Wing works on one digit at a time. In two rows, that digit has only two possible spots each, and those spots sit in the same two columns. They form a rectangle: the two digits must land on opposite corners.",
      steps: [
        { title: "Pick a digit and show your notes", text: "You look for an X-Wing on one digit at a time, on a grid where the notes (candidates) are filled in." },
        { title: "Find two rows with two spots", text: "Spot two rows where this digit has only two possible places — and those places are in the same columns." },
        { title: "The rectangle is formed", text: "The four cells make a rectangle. Whichever diagonal the digit takes, each of the two columns gets its digit from one of those two rows." },
        { title: "Eliminate elsewhere", text: "In those two columns the digit can no longer be in the other rows, so you can remove it from the other cells of those columns." },
      ],
      mistakes: [
        "Using two rows whose spots do not fall in exactly the same columns: that is not an X-Wing.",
        "Forgetting the rows need exactly two spots for the digit (not three).",
        "Searching without notes: the pattern is only visible on candidates.",
      ],
      faq: [
        { q: "Can the X-Wing be done with columns?", a: "Yes: it is the same reasoning turned by 90°. Two columns where the digit has two spots, in the same rows, let you remove it elsewhere in those rows." },
        { q: "At which level do you meet it?", a: "Mostly from Expert level up. Easy and Medium grids almost never need it." },
        { q: "What if I cannot see an X-Wing?", a: "Move on to another digit, or try the Y-Wing. Many grids do not contain one." },
      ],
      task: "Find the X-Wing: select the 4 cells that form the rectangle.",
    },
  },

  "y-wing": {
    slug: "y-wing",
    tech: "xy_wing",
    art: "/blog/technique-y-wing.png",
    artAlt: { fr: "Illustration du Y-Wing : un pivot et deux ailes en forme de Y", en: "Y-Wing illustration: a pivot and two wings forming a Y" },
    metaTitle: "La technique Y-Wing (XY-Wing) au sudoku : explication visuelle et exercices",
    metaDescription:
      "Apprenez le Y-Wing (XY-Wing) au sudoku : un pivot et deux ailes à deux candidats. Exemple illustré et exercices sur de vraies grilles.",
    fr: {
      name: "Y-Wing",
      tagline: "Un pivot et deux ailes, trois cases à deux candidats qui s'enchaînent.",
      summary: "Trois cases à deux candidats forment un pivot et deux ailes : un chiffre peut être éliminé des cases qui voient les deux ailes.",
      intro:
        "Le Y-Wing (aussi appelé XY-Wing) utilise trois cases qui n'ont chacune que deux candidats. Le pivot porte A et B ; une aile porte A et C, l'autre B et C. Les deux ailes voient le pivot.",
      steps: [
        { title: "Repère les cases à deux candidats", text: "Le Y-Wing n'utilise que des cases à deux notes. Commence par les repérer toutes." },
        { title: "Trouve le pivot et ses deux ailes", text: "Le pivot a deux chiffres, A et B. Cherche, dans sa ligne, sa colonne ou son bloc, une aile avec A et C, et une autre avec B et C." },
        { title: "Raisonne sur le pivot", text: "Si le pivot vaut A, l'aile en AC vaut C. S'il vaut B, c'est l'aile en BC qui vaut C. Dans les deux cas, une des ailes vaut C." },
        { title: "Élimine C", text: "Toute case qui voit les deux ailes ne peut pas contenir C : retire ce candidat." },
      ],
      mistakes: [
        "Prendre des ailes qui ne voient pas le pivot : elles doivent être dans sa ligne, sa colonne ou son bloc.",
        "Choisir deux ailes avec les mêmes chiffres : il faut AC et BC, le chiffre C étant commun aux deux.",
        "Éliminer C d'une case qui ne voit qu'une seule des deux ailes.",
      ],
      faq: [
        { q: "Quelle différence avec le X-Wing ?", a: "Le X-Wing se joue sur un seul chiffre. Le Y-Wing utilise trois cases et trois chiffres, et s'appuie sur des cases à deux candidats." },
        { q: "Pourquoi l'appelle-t-on aussi XY-Wing ?", a: "Les deux noms désignent la même technique. « XY » rappelle que les cases ont deux candidats, X et Y." },
        { q: "Faut-il toujours des notes ?", a: "Oui. Sans notes, impossible de savoir quelles cases n'ont que deux candidats." },
      ],
      task: "Trouve le Y-Wing : sélectionne le pivot et ses deux ailes (3 cases).",
    },
    en: {
      name: "Y-Wing",
      tagline: "A pivot and two wings: three two-candidate cells that chain together.",
      summary: "Three two-candidate cells form a pivot and two wings: a digit can be removed from cells that see both wings.",
      intro:
        "The Y-Wing (also called XY-Wing) uses three cells that each hold only two candidates. The pivot holds A and B; one wing holds A and C, the other B and C. Both wings see the pivot.",
      steps: [
        { title: "Find the two-candidate cells", text: "The Y-Wing only uses cells with two notes. Start by locating them all." },
        { title: "Find the pivot and its two wings", text: "The pivot has two digits, A and B. Look in its row, column or box for a wing with A and C, and another with B and C." },
        { title: "Reason on the pivot", text: "If the pivot is A, the AC wing is C. If it is B, the BC wing is C. Either way, one of the wings is C." },
        { title: "Eliminate C", text: "Any cell that sees both wings cannot hold C: remove that candidate." },
      ],
      mistakes: [
        "Using wings that do not see the pivot: they must share its row, column or box.",
        "Picking two wings with the same digits: you need AC and BC, with C common to both.",
        "Removing C from a cell that sees only one of the two wings.",
      ],
      faq: [
        { q: "How is it different from the X-Wing?", a: "The X-Wing works on a single digit. The Y-Wing uses three cells and three digits, built on two-candidate cells." },
        { q: "Why is it also called XY-Wing?", a: "Both names mean the same technique. “XY” recalls that the cells hold two candidates, X and Y." },
        { q: "Do you always need notes?", a: "Yes. Without notes you cannot tell which cells have only two candidates." },
      ],
      task: "Find the Y-Wing: select the pivot and its two wings (3 cells).",
    },
  },

  swordfish: {
    slug: "swordfish",
    tech: "swordfish",
    art: "/blog/technique-swordfish.png",
    artAlt: { fr: "Illustration d'un espadon, le swordfish", en: "Illustration of a swordfish" },
    article: "technique-swordfish",
    metaTitle: "La technique Swordfish au sudoku : explication visuelle et exercices",
    metaDescription:
      "Comprenez le Swordfish (espadon) au sudoku, grand frère du X-Wing : exemple illustré, étapes claires et exercices sur de vraies grilles.",
    fr: {
      name: "Swordfish",
      tagline: "Le grand frère du X-Wing : trois lignes, trois colonnes, un seul chiffre.",
      summary: "Trois lignes, trois colonnes, un même chiffre : le Swordfish étend le X-Wing et permet des éliminations plus rares.",
      intro:
        "Le Swordfish (« espadon ») applique le raisonnement du X-Wing à trois lignes. Un chiffre n'a que deux ou trois places dans chacune de trois lignes, et toutes ces places se trouvent dans trois colonnes seulement.",
      steps: [
        { title: "Choisis un chiffre", text: "Comme pour le X-Wing, le Swordfish se joue sur un seul chiffre, avec toutes les notes affichées." },
        { title: "Cherche trois lignes", text: "Trouve trois lignes où le chiffre a deux ou trois places, et où l'ensemble de ces places tient dans seulement trois colonnes." },
        { title: "Les trois chiffres se répartissent", text: "Les trois chiffres de ces lignes iront forcément un par colonne : chacune des trois colonnes aura son chiffre dans une de ces trois lignes." },
        { title: "Élimine ailleurs", text: "Dans ces trois colonnes, le chiffre ne peut plus être dans les autres lignes : retire-le des autres cases de ces colonnes." },
      ],
      mistakes: [
        "Chercher trois colonnes qui ne soient pas les mêmes pour les trois lignes : l'ensemble des colonnes utilisées doit être exactement de trois.",
        "Exiger trois places dans chaque ligne : deux suffisent, tant que le total ne dépasse pas trois colonnes.",
        "Chercher le Swordfish avant d'avoir épuisé les techniques plus simples (X-Wing, Y-Wing).",
      ],
      faq: [
        { q: "Est-ce plus rare que le X-Wing ?", a: "Oui, nettement : il demande une configuration plus précise. Mais sur les grilles les plus dures, il suffit parfois à tout débloquer." },
        { q: "Existe-t-il plus grand ?", a: "Oui, le Jellyfish (quatre lignes et quatre colonnes), mais il est extrêmement rare en pratique." },
        { q: "Comment le repérer sans se perdre ?", a: "Liste, pour un chiffre, les lignes où il n'a que deux ou trois places, puis cherche trois d'entre elles dont les colonnes se recoupent." },
      ],
      task: "Trouve le Swordfish : sélectionne toutes les cases du chiffre dans les trois lignes (ou colonnes) du motif.",
    },
    en: {
      name: "Swordfish",
      tagline: "The X-Wing's big brother: three rows, three columns, one digit.",
      summary: "Three rows, three columns, one digit: the Swordfish extends the X-Wing and allows rarer eliminations.",
      intro:
        "The Swordfish applies the X-Wing reasoning to three rows. A digit has only two or three spots in each of three rows, and all those spots lie in just three columns.",
      steps: [
        { title: "Pick a digit", text: "Like the X-Wing, the Swordfish works on a single digit, with all notes filled in." },
        { title: "Find three rows", text: "Find three rows where the digit has two or three spots, and where all those spots fit in only three columns." },
        { title: "The three digits spread out", text: "The three digits in those rows must land one per column: each of the three columns gets its digit from one of those rows." },
        { title: "Eliminate elsewhere", text: "In those three columns the digit can no longer be in the other rows: remove it from the other cells of those columns." },
      ],
      mistakes: [
        "Looking for three columns that differ between the rows: the columns used overall must be exactly three.",
        "Requiring three spots in every row: two are enough as long as the total stays within three columns.",
        "Hunting for a Swordfish before exhausting simpler techniques (X-Wing, Y-Wing).",
      ],
      faq: [
        { q: "Is it rarer than the X-Wing?", a: "Yes, clearly: it needs a more specific configuration. But on the hardest grids it sometimes unlocks everything." },
        { q: "Is there a bigger one?", a: "Yes, the Jellyfish (four rows and four columns), but it is extremely rare in practice." },
        { q: "How do I spot it without getting lost?", a: "List, for one digit, the rows where it has only two or three spots, then look for three of them whose columns overlap." },
      ],
      task: "Find the Swordfish: select every cell of the digit in the pattern's three rows (or columns).",
    },
  },
}
