import type { Difficulty } from "@/lib/sudoku"

/**
 * Textes des pages par niveau (/sudoku-facile … /sudoku-fou et /en/easy-sudoku … /en/crazy-sudoku).
 * Les chiffres (chiffres de départ, notes, techniques requises) viennent de l'analyse de la banque de grilles
 * avec le solveur (lib/solver.ts). À refaire si la banque est régénérée.
 */
export interface LevelText {
  h1: string
  metaTitle: string
  metaDescription: string
  lead: string
  sections: { h: string; p: string }[]
  /** Techniques utiles à ce niveau : lien vers la page de la technique. */
  techniques: { label: string; href: string }[]
  faq: { q: string; a: string }[]
}

export interface LevelPage {
  clues: [number, number]
  fr: LevelText
  en: LevelText
}

export const LEVEL_PAGES: Record<Difficulty, LevelPage> = {
  facile: {
    clues: [37, 46],
    fr: {
      h1: "Sudoku facile gratuit en ligne",
      metaTitle: "Sudoku facile gratuit en ligne",
      metaDescription:
        "Jouez au sudoku facile gratuitement : des grilles pour débuter, avec beaucoup de chiffres de départ et une solution unique. Sans inscription.",
      lead: "Des grilles idéales pour débuter ou se détendre : beaucoup de chiffres déjà placés et des déductions simples.",
      sections: [
        {
          h: "À qui s'adresse le niveau facile ?",
          p: "Aux débutants qui découvrent le jeu comme aux joueurs qui veulent une grille tranquille. Si vous ne connaissez pas encore les règles, lisez d'abord la page des règles du sudoku : elles se résument en une phrase.",
        },
        {
          h: "Ce qui vous attend",
          p: "Chaque grille Facile commence avec 37 à 46 chiffres sur 81. Dans la quasi-totalité des cas, elle se résout uniquement avec la technique du candidat unique : une case où un seul chiffre reste possible.",
        },
        {
          h: "Nos conseils",
          p: "Commencez par les blocs, lignes et colonnes les plus remplis. Balayez les chiffres un par un, de 1 à 9, en cherchant où chacun peut encore aller. Et ne devinez jamais : chaque grille se résout par la logique seule.",
        },
      ],
      techniques: [{ label: "Le candidat unique", href: "/techniques/candidat-unique" }],
      faq: [
        { q: "Un sudoku facile est-il adapté aux débutants ?", a: "Oui. Les grilles faciles ont beaucoup de chiffres de départ et se résolvent avec la seule technique du candidat unique, sans notes ni raisonnement compliqué." },
        { q: "Faut-il utiliser les notes au niveau facile ?", a: "Rarement. Elles deviennent indispensables à partir du niveau moyen, mais s'y habituer dès maintenant ne fait pas de mal." },
        { q: "Quand passer au niveau moyen ?", a: "Quand vous terminez les grilles faciles sans erreur et sans hésiter. Le niveau moyen introduit le pointage, une technique d'élimination." },
      ],
    },
    en: {
      h1: "Free easy sudoku online",
      metaTitle: "Free easy sudoku online",
      metaDescription:
        "Play easy sudoku for free: beginner-friendly puzzles with plenty of starting digits and a unique solution. No sign-up.",
      lead: "Ideal puzzles to get started or unwind: plenty of digits already placed and simple deductions.",
      sections: [
        {
          h: "Who is the easy level for?",
          p: "Beginners discovering the game as well as players who want a relaxed puzzle. If you do not know the rules yet, read the sudoku rules page first: they fit in a single sentence.",
        },
        {
          h: "What to expect",
          p: "Every Easy puzzle starts with 37 to 46 digits out of 81. In almost every case it is solved with the naked single technique alone: a cell where only one digit remains possible.",
        },
        {
          h: "Our tips",
          p: "Start with the fullest boxes, rows and columns. Scan the digits one by one, from 1 to 9, looking for where each can still go. And never guess: every puzzle can be solved by logic alone.",
        },
      ],
      techniques: [{ label: "The naked single", href: "/techniques/candidat-unique" }],
      faq: [
        { q: "Is easy sudoku suitable for beginners?", a: "Yes. Easy puzzles have many starting digits and are solved with the naked single technique alone, with no notes or complicated reasoning." },
        { q: "Should I use notes at the easy level?", a: "Rarely. They become essential from the medium level, but getting used to them now does no harm." },
        { q: "When should I move up to medium?", a: "When you finish easy puzzles without mistakes and without hesitating. Medium introduces pointing pairs, an elimination technique." },
      ],
    },
  },
  moyen: {
    clues: [31, 38],
    fr: {
      h1: "Sudoku moyen gratuit en ligne",
      metaTitle: "Sudoku moyen gratuit en ligne",
      metaDescription:
        "Jouez au sudoku moyen gratuitement : des grilles à solution unique, pour progresser avec le pointage et les paires nues. Sans inscription.",
      lead: "Le niveau pour progresser : moins de chiffres au départ et les premières techniques d'élimination.",
      sections: [
        {
          h: "Ce qui change par rapport au niveau facile",
          p: "Les grilles Moyen commencent avec 31 à 38 chiffres sur 81. Les candidats uniques ne suffisent plus : il faut éliminer des possibilités pour débloquer la grille.",
        },
        {
          h: "Les techniques à connaître",
          p: "Le pointage intervient dans environ neuf grilles sur dix : un chiffre aligné dans un bloc permet de l'éliminer du reste de la ligne ou de la colonne. Les paires nues apparaissent dans environ une grille sur cinq.",
        },
        {
          h: "Nos conseils",
          p: "Notez les candidats dans les cases dès que vous bloquez : c'est à ce niveau que les notes deviennent un vrai atout. Mettez-les à jour après chaque chiffre posé.",
        },
      ],
      techniques: [
        { label: "Le pointage", href: "/techniques/pointage" },
        { label: "Les paires nues", href: "/techniques/paires-nues" },
        { label: "Le candidat unique", href: "/techniques/candidat-unique" },
      ],
      faq: [
        { q: "Comment résoudre un sudoku moyen ?", a: "Posez d'abord tous les candidats uniques, puis notez les candidats des cases restantes et cherchez des pointages : un chiffre aligné dans un bloc que l'on peut retirer du reste de la ligne ou de la colonne." },
        { q: "Les notes sont-elles obligatoires au niveau moyen ?", a: "Pas obligatoires, mais très utiles : le pointage se voit presque uniquement avec les notes." },
        { q: "Faut-il deviner sur une grille moyenne ?", a: "Jamais. Toutes nos grilles se résolvent par la logique seule, sans essai-erreur." },
      ],
    },
    en: {
      h1: "Free medium sudoku online",
      metaTitle: "Free medium sudoku online",
      metaDescription:
        "Play medium sudoku for free: unique-solution puzzles to improve with pointing pairs and naked pairs. No sign-up.",
      lead: "The level to improve: fewer starting digits and the first elimination techniques.",
      sections: [
        {
          h: "What changes from the easy level",
          p: "Medium puzzles start with 31 to 38 digits out of 81. Naked singles are no longer enough: you have to eliminate possibilities to unlock the puzzle.",
        },
        {
          h: "Techniques to know",
          p: "Pointing pairs come into play in about nine puzzles out of ten: a digit lined up in a box lets you remove it from the rest of the row or column. Naked pairs appear in about one puzzle in five.",
        },
        {
          h: "Our tips",
          p: "Write candidates in the cells as soon as you get stuck: this is where notes become a real asset. Update them after every digit you place.",
        },
      ],
      techniques: [
        { label: "Pointing pairs", href: "/techniques/pointage" },
        { label: "Naked pairs", href: "/techniques/paires-nues" },
        { label: "The naked single", href: "/techniques/candidat-unique" },
      ],
      faq: [
        { q: "How do I solve a medium sudoku?", a: "First place every naked single, then note the candidates of the remaining cells and look for pointing pairs: a digit lined up in a box that you can remove from the rest of the row or column." },
        { q: "Are notes required at the medium level?", a: "Not required, but very useful: pointing pairs are almost only visible with notes." },
        { q: "Do I need to guess on a medium puzzle?", a: "Never. All our puzzles can be solved by logic alone, with no trial and error." },
      ],
    },
  },
  difficile: {
    clues: [25, 32],
    fr: {
      h1: "Sudoku difficile gratuit en ligne",
      metaTitle: "Sudoku difficile gratuit en ligne",
      metaDescription:
        "Jouez au sudoku difficile gratuitement : grilles à solution unique, résolubles sans deviner, avec paires et triplets nus ou cachés. Sans inscription.",
      lead: "Un vrai défi de logique : peu de chiffres au départ, et des paires et triplets à débusquer.",
      sections: [
        {
          h: "Ce qui vous attend",
          p: "Les grilles Difficile commencent avec seulement 25 à 32 chiffres sur 81. Elles se résolvent toujours par la logique, mais il faut combiner plusieurs techniques d'élimination.",
        },
        {
          h: "Les techniques à connaître",
          p: "Les paires nues servent dans environ sept grilles sur dix, les triplets nus et les paires cachées dans plus de la moitié d'entre elles, les triplets cachés dans environ une sur cinq. Le pointage reste présent dans presque toutes.",
        },
        {
          h: "Nos conseils",
          p: "Tenez vos notes à jour sur toute la grille, pas seulement dans la zone où vous travaillez. Quand vous êtes bloqué, cherchez d'abord les cases qui n'ont que deux candidats : c'est là que se cachent les paires.",
        },
      ],
      techniques: [
        { label: "Les paires nues", href: "/techniques/paires-nues" },
        { label: "Les paires cachées", href: "/techniques/paires-cachees" },
        { label: "Le pointage", href: "/techniques/pointage" },
      ],
      faq: [
        { q: "Un sudoku difficile peut-il se résoudre sans deviner ?", a: "Oui. Chaque grille de notre site a une solution unique et se résout par pure logique, même au niveau difficile." },
        { q: "Quelles techniques faut-il maîtriser ?", a: "Les paires et triplets nus, les paires et triplets cachés, et le pointage. Les motifs avancés comme le X-Wing ne servent qu'à partir du niveau expert." },
        { q: "Pourquoi suis-je bloqué sur une grille difficile ?", a: "Le plus souvent parce que les notes ne sont pas à jour. Complétez-les sur toute la grille, puis cherchez les paires." },
      ],
    },
    en: {
      h1: "Free hard sudoku online",
      metaTitle: "Free hard sudoku online",
      metaDescription:
        "Play hard sudoku for free: unique-solution puzzles you can solve without guessing, with naked and hidden pairs and triples. No sign-up.",
      lead: "A real logic challenge: few digits at the start, and pairs and triples to hunt down.",
      sections: [
        {
          h: "What to expect",
          p: "Hard puzzles start with only 25 to 32 digits out of 81. They can always be solved by logic, but you have to combine several elimination techniques.",
        },
        {
          h: "Techniques to know",
          p: "Naked pairs are used in about seven puzzles out of ten, naked triples and hidden pairs in more than half of them, hidden triples in about one in five. Pointing pairs are still present in almost all of them.",
        },
        {
          h: "Our tips",
          p: "Keep your notes up to date across the whole grid, not only in the area you are working on. When you are stuck, look first at cells that have only two candidates: that is where pairs hide.",
        },
      ],
      techniques: [
        { label: "Naked pairs", href: "/techniques/paires-nues" },
        { label: "Hidden pairs", href: "/techniques/paires-cachees" },
        { label: "Pointing pairs", href: "/techniques/pointage" },
      ],
      faq: [
        { q: "Can a hard sudoku be solved without guessing?", a: "Yes. Every puzzle on our site has a unique solution and is solved by pure logic, even at the hard level." },
        { q: "Which techniques should I master?", a: "Naked pairs and triples, hidden pairs and triples, and pointing pairs. Advanced patterns such as the X-Wing are only needed from the expert level." },
        { q: "Why am I stuck on a hard puzzle?", a: "Most often because the notes are not up to date. Complete them across the whole grid, then look for pairs." },
      ],
    },
  },
  expert: {
    clues: [24, 29],
    fr: {
      h1: "Sudoku expert gratuit en ligne",
      metaTitle: "Sudoku expert gratuit en ligne",
      metaDescription:
        "Jouez au sudoku expert gratuitement : grilles à solution unique qui demandent des techniques avancées comme le Y-Wing et le X-Wing. Sans inscription.",
      lead: "Pour les joueurs aguerris : les techniques de base ne suffisent plus, il faut des motifs avancés.",
      sections: [
        {
          h: "Ce qui vous attend",
          p: "Les grilles Expert commencent avec 24 à 29 chiffres sur 81. Les paires et les triplets ne suffisent plus à débloquer la grille.",
        },
        {
          h: "Les techniques à connaître",
          p: "Les motifs sur un seul chiffre, comme le turbot, servent dans environ sept grilles sur dix. Plus de quatre grilles sur dix demandent un Y-Wing, et près d'une sur trois un X-Wing. Le X-Wing et le Y-Wing ont chacun une leçon avec exercices sur ce site.",
        },
        {
          h: "Nos conseils",
          p: "Quand les paires et les triplets ne donnent plus rien, changez d'approche : choisissez un chiffre et cherchez s'il dessine un rectangle (X-Wing), ou cherchez trois cases à deux candidats qui s'enchaînent (Y-Wing).",
        },
      ],
      techniques: [
        { label: "Le X-Wing", href: "/techniques/x-wing" },
        { label: "Le Y-Wing", href: "/techniques/y-wing" },
        { label: "Les paires cachées", href: "/techniques/paires-cachees" },
      ],
      faq: [
        { q: "Quelles techniques pour un sudoku expert ?", a: "Les motifs avancés sur un seul chiffre (turbot, X-Wing) et le Y-Wing, en plus des paires et triplets. Les leçons X-Wing et Y-Wing de ce site permettent de s'entraîner sur de vraies grilles." },
        { q: "Un sudoku expert demande-t-il de deviner ?", a: "Non. Toutes les grilles sont vérifiées : elles se résolvent par déduction, même au niveau expert." },
        { q: "Comment passer au niveau diabolique ?", a: "Quand le X-Wing et le Y-Wing deviennent des réflexes. Le niveau diabolique ajoute les chaînes XY." },
      ],
    },
    en: {
      h1: "Free expert sudoku online",
      metaTitle: "Free expert sudoku online",
      metaDescription:
        "Play expert sudoku for free: unique-solution puzzles that need advanced techniques such as the Y-Wing and X-Wing. No sign-up.",
      lead: "For seasoned players: basic techniques are no longer enough, you need advanced patterns.",
      sections: [
        {
          h: "What to expect",
          p: "Expert puzzles start with 24 to 29 digits out of 81. Pairs and triples are no longer enough to unlock the puzzle.",
        },
        {
          h: "Techniques to know",
          p: "Single-digit patterns, such as the turbot fish, are used in about seven puzzles out of ten. More than four puzzles out of ten need a Y-Wing, and nearly one in three an X-Wing. The X-Wing and the Y-Wing each have a lesson with exercises on this site.",
        },
        {
          h: "Our tips",
          p: "When pairs and triples give nothing more, change your approach: pick a digit and see whether it draws a rectangle (X-Wing), or look for three two-candidate cells that chain together (Y-Wing).",
        },
      ],
      techniques: [
        { label: "The X-Wing", href: "/techniques/x-wing" },
        { label: "The Y-Wing", href: "/techniques/y-wing" },
        { label: "Hidden pairs", href: "/techniques/paires-cachees" },
      ],
      faq: [
        { q: "Which techniques do I need for an expert sudoku?", a: "Advanced single-digit patterns (turbot fish, X-Wing) and the Y-Wing, on top of pairs and triples. The X-Wing and Y-Wing lessons on this site let you practise on real grids." },
        { q: "Does an expert sudoku require guessing?", a: "No. Every puzzle is checked: they are solved by deduction, even at the expert level." },
        { q: "How do I move up to diabolical?", a: "When the X-Wing and Y-Wing become reflexes. The diabolical level adds XY-chains." },
      ],
    },
  },
  diabolique: {
    clues: [24, 28],
    fr: {
      h1: "Sudoku diabolique gratuit en ligne",
      metaTitle: "Sudoku diabolique gratuit en ligne",
      metaDescription:
        "Jouez au sudoku diabolique gratuitement : grilles à solution unique qui demandent des chaînes XY, Y-Wing et X-Wing. Sans inscription.",
      lead: "Des grilles redoutables, mais toujours résolubles par la logique : les chaînes deviennent indispensables.",
      sections: [
        {
          h: "Ce qui vous attend",
          p: "Les grilles Diabolique commencent avec 24 à 28 chiffres sur 81. Elles ne se résolvent pas sans raisonner sur des enchaînements de cases.",
        },
        {
          h: "Les techniques à connaître",
          p: "Les chaînes XY interviennent dans pratiquement toutes les grilles Diabolique : on relie plusieurs cases à deux candidats pour en déduire une élimination. Le Y-Wing, que l'on peut voir comme une petite chaîne XY, apparaît dans environ trois grilles sur dix, le X-Wing dans environ une sur sept, et le Swordfish plus rarement.",
        },
        {
          h: "Nos conseils",
          p: "Repérez toutes les cases à deux candidats et suivez-les de proche en proche : si un chiffre part d'une case et revient, des éliminations apparaissent. Commencez par bien maîtriser le Y-Wing, qui prépare à ce raisonnement.",
        },
      ],
      techniques: [
        { label: "Le Y-Wing", href: "/techniques/y-wing" },
        { label: "Le X-Wing", href: "/techniques/x-wing" },
        { label: "Le Swordfish", href: "/techniques/swordfish" },
      ],
      faq: [
        { q: "Qu'est-ce qu'une chaîne XY ?", a: "Une suite de cases à deux candidats, chacune partageant un chiffre avec la suivante. Si la chaîne relie deux extrémités qui contiennent le même chiffre, l'une des deux le contient forcément : toute case qui voit les deux extrémités ne peut pas contenir ce chiffre." },
        { q: "Un sudoku diabolique est-il vraiment résoluble sans deviner ?", a: "Oui. Chaque grille est vérifiée par notre solveur logique : une solution unique, trouvable par déduction seule." },
        { q: "Par où commencer pour progresser ?", a: "Par le Y-Wing, la porte d'entrée des chaînes, puis le X-Wing et le Swordfish pour les motifs sur un seul chiffre." },
      ],
    },
    en: {
      h1: "Free diabolical sudoku online",
      metaTitle: "Free diabolical sudoku online",
      metaDescription:
        "Play diabolical sudoku for free: unique-solution puzzles that need XY-chains, Y-Wing and X-Wing. No sign-up.",
      lead: "Fearsome puzzles that can still be solved by logic: chains become essential.",
      sections: [
        {
          h: "What to expect",
          p: "Diabolical puzzles start with 24 to 28 digits out of 81. They cannot be solved without reasoning about chains of cells.",
        },
        {
          h: "Techniques to know",
          p: "XY-chains appear in practically every Diabolical puzzle: you link several two-candidate cells to deduce an elimination. The Y-Wing, which you can see as a small XY-chain, appears in about three puzzles out of ten, the X-Wing in about one in seven, and the Swordfish more rarely.",
        },
        {
          h: "Our tips",
          p: "Find all the two-candidate cells and follow them step by step: if a digit starts from one cell and comes back, eliminations appear. Start by mastering the Y-Wing, which prepares you for this reasoning.",
        },
      ],
      techniques: [
        { label: "The Y-Wing", href: "/techniques/y-wing" },
        { label: "The X-Wing", href: "/techniques/x-wing" },
        { label: "The Swordfish", href: "/techniques/swordfish" },
      ],
      faq: [
        { q: "What is an XY-chain?", a: "A sequence of two-candidate cells, each sharing a digit with the next. If the chain links two ends that hold the same digit, one of them must contain it: any cell that sees both ends cannot contain that digit." },
        { q: "Can a diabolical sudoku really be solved without guessing?", a: "Yes. Every puzzle is checked by our logic solver: a unique solution, findable by deduction alone." },
        { q: "Where should I start to improve?", a: "With the Y-Wing, the entry point to chains, then the X-Wing and the Swordfish for single-digit patterns." },
      ],
    },
  },
  fou: {
    clues: [22, 27],
    fr: {
      h1: "Sudoku fou gratuit en ligne",
      metaTitle: "Sudoku fou gratuit en ligne",
      metaDescription:
        "Jouez au sudoku fou gratuitement : les grilles les plus dures du site, à solution unique, avec chaînes XY, XYZ-Wing et Swordfish. Sans inscription.",
      lead: "Le niveau maximal : les grilles les plus difficiles du site, pour les passionnés de logique.",
      sections: [
        {
          h: "Ce qui vous attend",
          p: "Les grilles Fou commencent avec seulement 22 à 27 chiffres sur 81. Elles combinent plusieurs motifs avancés, et c'est leur enchaînement qui fait la difficulté.",
        },
        {
          h: "Les techniques à connaître",
          p: "Les chaînes XY sont présentes dans toutes les grilles Fou. Elles sont accompagnées, selon les cas, du turbot (environ huit grilles sur dix), du Y-Wing (plus d'une grille sur deux), du XYZ-Wing (environ quatre sur dix), du X-Wing et, plus rarement, du Swordfish ou même du Jellyfish.",
        },
        {
          h: "Nos conseils",
          p: "Prenez le temps : une grille Fou se joue sur plusieurs dizaines de minutes. Gardez vos notes impeccables, et si vous êtes bloqué, faites une pause : un regard neuf repère souvent le motif que l'on ne voyait plus.",
        },
      ],
      techniques: [
        { label: "Le Swordfish", href: "/techniques/swordfish" },
        { label: "Le Y-Wing", href: "/techniques/y-wing" },
        { label: "Le X-Wing", href: "/techniques/x-wing" },
      ],
      faq: [
        { q: "Les grilles du niveau fou ont-elles une solution unique ?", a: "Oui, comme toutes les grilles du site. Elles se résolvent par la logique seule, mais en demandant plusieurs motifs avancés." },
        { q: "Combien de temps faut-il pour une grille fou ?", a: "Cela dépend de votre expérience, mais comptez nettement plus longtemps que pour un niveau expert. Prenez le temps de bien tenir vos notes." },
        { q: "Quelle différence avec le niveau diabolique ?", a: "Moins de chiffres au départ, et des enchaînements de motifs plus longs : les chaînes XY sont toujours présentes, mais s'y ajoutent d'autres motifs avancés." },
      ],
    },
    en: {
      h1: "Free crazy sudoku online",
      metaTitle: "Free crazy sudoku online",
      metaDescription:
        "Play crazy sudoku for free: the site's hardest unique-solution puzzles, with XY-chains, XYZ-Wing and Swordfish. No sign-up.",
      lead: "The top level: the hardest puzzles on the site, for logic enthusiasts.",
      sections: [
        {
          h: "What to expect",
          p: "Crazy puzzles start with only 22 to 27 digits out of 81. They combine several advanced patterns, and it is the way these chain together that makes them hard.",
        },
        {
          h: "Techniques to know",
          p: "XY-chains are present in every Crazy puzzle. They are accompanied, depending on the puzzle, by the turbot fish (about eight puzzles out of ten), the Y-Wing (more than one puzzle in two), the XYZ-Wing (about four in ten), the X-Wing and, more rarely, the Swordfish or even the Jellyfish.",
        },
        {
          h: "Our tips",
          p: "Take your time: a Crazy puzzle can take several dozen minutes. Keep your notes spotless, and if you are stuck, take a break: fresh eyes often spot the pattern you could no longer see.",
        },
      ],
      techniques: [
        { label: "The Swordfish", href: "/techniques/swordfish" },
        { label: "The Y-Wing", href: "/techniques/y-wing" },
        { label: "The X-Wing", href: "/techniques/x-wing" },
      ],
      faq: [
        { q: "Do crazy-level puzzles have a unique solution?", a: "Yes, like every puzzle on the site. They are solved by logic alone, but they require several advanced patterns." },
        { q: "How long does a crazy puzzle take?", a: "It depends on your experience, but expect much longer than an expert puzzle. Take the time to keep your notes accurate." },
        { q: "What is the difference with the diabolical level?", a: "Fewer starting digits and longer chains of patterns: XY-chains are always present, with other advanced patterns added on top." },
      ],
    },
  },
}
