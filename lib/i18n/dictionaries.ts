export type Locale = "fr" | "en"
export type Dictionary = typeof fr

const fr = {
    nav: { play: "Jouer", rules: "Règles", techniques: "Techniques" },

    footer: {
      tagline: "Le sudoku gratuit, sans inscription, généré à l'infini.",
      gameHeading: "Jeu",
      legalHeading: "Informations",
      play: "Jouer au sudoku",
      rules: "Règles du sudoku",
      techniques: "Techniques et astuces",
      privacy: "Politique de confidentialité",
      legal: "Mentions légales",
      contact: "Contact",
      rights: "Tous droits réservés.",
    },

    cookie: {
      message: "Nous utilisons des cookies pour améliorer votre expérience et mesurer notre audience. Consultez notre",
      policyLink: "politique de confidentialité",
      refuse: "Refuser",
      accept: "Accepter",
    },

    toolbar: {
      undo: "Annuler",
      erase: "Effacer",
      notes: "Notes",
      on: "ON",
      off: "OFF",
      print: "Imprimer",
    },

    game: {
      errors: "Erreurs",
      time: "Temps",
      difficultyLabel: "Difficulté :",
      filled: "Grille remplie",
      newGame: "Nouvelle grille",
      difficulties: { facile: "Facile", moyen: "Moyen", difficile: "Difficile", expert: "Expert" },
      pause: "Mettre en pause",
      resume: "Reprendre",
      paused: "Partie en pause",
      wonTitle: "Bravo, grille terminée !",
      wonText: "Vous avez résolu cette grille sans aucune erreur.",
      mistakeWord: (n: number): string => (n > 1 ? "erreurs" : "erreur"),
      solutionLabel: "Solution",
      hintKeyboard: "Astuce : utilisez les flèches du clavier pour vous déplacer et les touches 1-9 pour saisir. Appuyez sur « N » pour les notes.",
    },

    printDialog: {
      title: "Imprimer la grille",
      question: "Voulez-vous inclure la solution sur une deuxième page ?",
      without: "Imprimer sans la solution",
      with: "Imprimer avec la solution (page 2)",
      cancel: "Annuler",
    },

    languageToggle: { label: "English" },

    rules: {
      title: "Les règles du sudoku",
      intro:
        "Le sudoku est un jeu de logique qui se joue sur une grille de 81 cases, divisée en 9 régions de 9 cases. Le but : remplir toute la grille avec les chiffres de 1 à 9 en respectant trois règles simples.",
      rulesList: [
        { title: "Chaque ligne", text: "Chaque ligne horizontale doit contenir tous les chiffres de 1 à 9, sans aucune répétition." },
        { title: "Chaque colonne", text: "Chaque colonne verticale doit elle aussi contenir les chiffres de 1 à 9, une seule fois chacun." },
        { title: "Chaque région", text: "Les 9 régions de 3×3 cases doivent contenir tous les chiffres de 1 à 9 sans doublon." },
      ],
      videoHeading: "La vidéo qui explique tout",
      videoText:
        "Vous préférez qu'on vous explique à l'oral avec des exemples à l'écran ? Voici la vidéo YouTube dédiée aux règles du sudoku, pas à pas.",
      startHeading: "Comment commencer une partie",
      startSteps: [
        "La grille de départ contient déjà quelques chiffres : ce sont les indices. Ils ne peuvent pas être modifiés.",
        "Cherchez les cases où un seul chiffre est possible en éliminant ceux déjà présents dans la ligne, la colonne et la région.",
        "Placez ce chiffre, puis répétez l'opération. Chaque chiffre placé en révèle de nouveaux.",
        "La grille est terminée lorsque les 81 cases sont remplies sans aucune répétition.",
      ],
      tipsHeading: "Bon à savoir",
      tips: [
        "Une grille de sudoku bien conçue n'a qu'une seule solution.",
        "Il n'est jamais nécessaire de deviner : la logique suffit toujours.",
        "Utilisez les notes pour marquer les chiffres possibles dans une case.",
        "Le chiffre le plus contraint (celui qui apparaît déjà le plus souvent sur la grille) est souvent le bon point de départ.",
      ],
      ctaPlay: "Jouer une grille",
      ctaTechniques: "Voir les techniques",
    },

    techniques: {
      title: "Techniques et astuces",
      intro:
        "Du placement le plus simple aux stratégies plus avancées, voici les méthodes qui vous feront progresser et résoudre des grilles de plus en plus difficiles.",
      items: [
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
          title: "Les paires cachées",
          text: "Si un couple de chiffres candidats n'apparaît que dans deux cases d'une même zone (même noyé au milieu d'autres candidats), ces deux cases leur sont réservées. Tous les autres candidats de ces cases peuvent être éliminés.",
        },
        {
          level: "Avancé",
          title: "L'élimination croisée",
          text: "Combinez plusieurs zones à la fois : quand un chiffre ne peut se placer que dans une intersection commune à deux régions, ligne et colonne, cette intersection devient souvent la clé pour débloquer toute la grille.",
        },
      ],
      notesHeading: "La méthode des notes",
      notesText:
        "Sur les grilles difficiles, notez systématiquement les chiffres candidats dans chaque case vide. Au fil de vos placements, éliminez les candidats devenus impossibles : les techniques ci-dessus deviennent alors beaucoup plus faciles à repérer. Dans notre jeu, activez le mode « Notes » ou appuyez sur la touche « N ».",
      ctaPractice: "Mettre en pratique",
      ctaRules: "Revoir les règles",
    },

    contact: {
      title: "Contact",
      intro: "Une question, une suggestion d'amélioration ou un bug à signaler ? Écrivez-nous, nous lisons tous les messages.",
      nameLabel: "Nom",
      emailLabel: "Adresse e-mail",
      messageLabel: "Message",
      send: "Envoyer le message",
      sentTitle: "Message envoyé !",
      sentText: "Merci de nous avoir contactés. Nous reviendrons vers vous dès que possible.",
      sendAnother: "Envoyer un autre message",
      directEmail: "Vous pouvez aussi nous écrire directement à",
    },

    legal: {
      title: "Mentions légales",
      updated: "Dernière mise à jour :",
      sections: [
        {
          title: "Éditeur du site",
          text: "Le site Sudoku Club est un projet de jeu en ligne gratuit. Les informations relatives à l'éditeur peuvent être obtenues via la page Contact.",
        },
        {
          title: "Hébergement",
          text: "Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.",
        },
        {
          title: "Propriété intellectuelle",
          text: "L'ensemble des contenus présents sur ce site (textes, interface, code) est protégé par le droit de la propriété intellectuelle. Toute reproduction sans autorisation est interdite. Le sudoku, en tant que principe de jeu, appartient au domaine public.",
        },
        {
          title: "Responsabilité",
          text: "Sudoku Club s'efforce d'assurer l'exactitude des informations et le bon fonctionnement du jeu, sans toutefois pouvoir le garantir en toutes circonstances. L'utilisation du site se fait sous la seule responsabilité de l'utilisateur.",
        },
      ],
    },

    privacy: {
      title: "Politique de confidentialité",
      updated: "Dernière mise à jour :",
      sections: [
        {
          title: "1. Introduction",
          text: "La présente politique de confidentialité décrit la manière dont Sudoku Club (« nous ») traite les informations lorsque vous utilisez notre site. Nous accordons une grande importance au respect de votre vie privée et à la protection de vos données personnelles.",
        },
        {
          title: "2. Données collectées",
          text: "Le jeu de sudoku fonctionne entièrement dans votre navigateur et ne nécessite aucune inscription. Nous ne collectons pas de données personnelles identifiantes pour jouer. Certaines préférences (comme le thème clair/sombre ou la langue) sont stockées localement sur votre appareil.",
        },
        {
          title: "3. Cookies et mesure d'audience",
          text: "Nous pouvons utiliser des cookies afin de mesurer l'audience du site (Google Analytics) et d'afficher des publicités adaptées. Vous pouvez accepter ou refuser ces cookies via la bannière de consentement affichée lors de votre première visite, et modifier votre choix à tout moment.",
        },
        {
          title: "4. Publicité",
          text: "Ce site peut afficher des publicités fournies par des régies tierces (dont Google AdSense). Ces partenaires sont susceptibles d'utiliser des cookies pour proposer des annonces pertinentes. Aucune donnée sensible n'est partagée.",
        },
        {
          title: "5. Vos droits",
          text: "Conformément à la réglementation applicable (notamment le RGPD), vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Pour toute demande, contactez-nous via la page Contact.",
        },
        {
          title: "6. Contact",
          text: "Pour toute question relative à cette politique de confidentialité, vous pouvez nous écrire depuis la page Contact du site.",
        },
      ],
    },
}

const en: Dictionary = {
    nav: { play: "Play", rules: "Rules", techniques: "Techniques" },

    footer: {
      tagline: "Free sudoku, no sign-up, endless unique puzzles.",
      gameHeading: "Game",
      legalHeading: "Information",
      play: "Play sudoku",
      rules: "Sudoku rules",
      techniques: "Techniques and tips",
      privacy: "Privacy policy",
      legal: "Legal notice",
      contact: "Contact",
      rights: "All rights reserved.",
    },

    cookie: {
      message: "We use cookies to improve your experience and measure our audience. Read our",
      policyLink: "privacy policy",
      refuse: "Decline",
      accept: "Accept",
    },

    toolbar: {
      undo: "Undo",
      erase: "Erase",
      notes: "Notes",
      on: "ON",
      off: "OFF",
      print: "Print",
    },

    game: {
      errors: "Errors",
      time: "Time",
      difficultyLabel: "Difficulty:",
      filled: "Grid filled",
      newGame: "New puzzle",
      difficulties: { facile: "Easy", moyen: "Medium", difficile: "Hard", expert: "Expert" },
      pause: "Pause",
      resume: "Resume",
      paused: "Game paused",
      wonTitle: "Well done, puzzle solved!",
      wonText: "You solved this grid without any mistake.",
      mistakeWord: (n: number) => (n > 1 ? "mistakes" : "mistake"),
      solutionLabel: "Solution",
      hintKeyboard: "Tip: use the arrow keys to move around and keys 1-9 to enter numbers. Press \"N\" for notes.",
    },

    printDialog: {
      title: "Print the grid",
      question: "Do you want to include the solution on a second page?",
      without: "Print without the solution",
      with: "Print with the solution (page 2)",
      cancel: "Cancel",
    },

    languageToggle: { label: "Français" },

    rules: {
      title: "The rules of sudoku",
      intro:
        "Sudoku is a logic game played on an 81-cell grid, split into 9 regions of 9 cells. The goal: fill the entire grid with digits 1 to 9 while following three simple rules.",
      rulesList: [
        { title: "Every row", text: "Each horizontal row must contain every digit from 1 to 9, with no repeats." },
        { title: "Every column", text: "Each vertical column must also contain the digits 1 to 9, exactly once each." },
        { title: "Every region", text: "Each of the 9 blocks of 3×3 cells must contain all digits 1 to 9 with no duplicates." },
      ],
      videoHeading: "The video that explains it all",
      videoText:
        "Prefer a spoken walkthrough with on-screen examples? Here's the YouTube video dedicated to the rules of sudoku, step by step.",
      startHeading: "How to start a game",
      startSteps: [
        "The starting grid already has a few numbers filled in: these are the clues. They can't be changed.",
        "Look for cells where only one digit is possible, by ruling out digits already present in the row, column and region.",
        "Place that digit, then repeat. Every digit placed reveals new possibilities.",
        "The grid is complete once all 81 cells are filled with no repeats.",
      ],
      tipsHeading: "Good to know",
      tips: [
        "A well-designed sudoku grid has only one solution.",
        "You never need to guess: logic is always enough.",
        "Use notes to mark the possible digits in a cell.",
        "The most constrained digit (the one already appearing most often on the grid) is usually the best place to start.",
      ],
      ctaPlay: "Play a puzzle",
      ctaTechniques: "See techniques",
    },

    techniques: {
      title: "Techniques and tips",
      intro:
        "From the simplest placements to more advanced strategies, here are the methods that will help you improve and solve increasingly difficult grids.",
      items: [
        {
          level: "Beginner",
          title: "Single candidate",
          text: "Spot the cells where only one digit is possible. By scanning each row, column and region, you rule out digits already placed until only one possibility remains.",
        },
        {
          level: "Beginner",
          title: "Last digit in a zone",
          text: "When a row, column or region already contains 8 digits, the remaining cell can only take the missing digit. It's the fastest placement to spot.",
        },
        {
          level: "Intermediate",
          title: "Naked pairs",
          text: "If two cells in the same zone can only contain the same two digits, those digits are reserved for them. You can then eliminate them from every other cell in that zone.",
        },
        {
          level: "Intermediate",
          title: "Pointing pairs",
          text: "When a candidate digit in a region only appears in a single row or column, it can be removed from the rest of that row or column, outside the region.",
        },
        {
          level: "Advanced",
          title: "Hidden pairs",
          text: "If a pair of candidate digits only appears in two cells of the same zone (even buried among other candidates), those two cells are reserved for them. Every other candidate in those cells can be eliminated.",
        },
        {
          level: "Advanced",
          title: "Cross elimination",
          text: "Combine several zones at once: when a digit can only go in a cell shared by two regions, a row and a column, that intersection often becomes the key to unlocking the whole grid.",
        },
      ],
      notesHeading: "The notes method",
      notesText:
        "On hard grids, systematically jot down candidate digits in every empty cell. As you place numbers, remove candidates that become impossible: the techniques above then become much easier to spot. In our game, turn on \"Notes\" mode or press the \"N\" key.",
      ctaPractice: "Put it into practice",
      ctaRules: "Review the rules",
    },

    contact: {
      title: "Contact",
      intro: "A question, a suggestion, or a bug to report? Write to us, we read every message.",
      nameLabel: "Name",
      emailLabel: "Email address",
      messageLabel: "Message",
      send: "Send message",
      sentTitle: "Message sent!",
      sentText: "Thanks for reaching out. We'll get back to you as soon as possible.",
      sendAnother: "Send another message",
      directEmail: "You can also write to us directly at",
    },

    legal: {
      title: "Legal notice",
      updated: "Last updated:",
      sections: [
        {
          title: "Site publisher",
          text: "Sudoku Club is a free online game project. Information about the publisher can be obtained via the Contact page.",
        },
        {
          title: "Hosting",
          text: "This site is hosted by Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, United States.",
        },
        {
          title: "Intellectual property",
          text: "All content on this site (text, interface, code) is protected by intellectual property law. Reproduction without authorization is prohibited. Sudoku, as a game concept, is in the public domain.",
        },
        {
          title: "Liability",
          text: "Sudoku Club strives to ensure the accuracy of information and the proper functioning of the game, without being able to guarantee it in all circumstances. Use of the site is at the user's own responsibility.",
        },
      ],
    },

    privacy: {
      title: "Privacy policy",
      updated: "Last updated:",
      sections: [
        {
          title: "1. Introduction",
          text: "This privacy policy describes how Sudoku Club (\"we\") handles information when you use our site. We place great importance on respecting your privacy and protecting your personal data.",
        },
        {
          title: "2. Data collected",
          text: "The sudoku game runs entirely in your browser and requires no sign-up. We do not collect personally identifying data to play. Some preferences (such as light/dark theme or language) are stored locally on your device.",
        },
        {
          title: "3. Cookies and audience measurement",
          text: "We may use cookies to measure site audience (Google Analytics) and to display relevant ads. You can accept or decline these cookies via the consent banner shown on your first visit, and change your choice at any time.",
        },
        {
          title: "4. Advertising",
          text: "This site may display ads provided by third-party ad networks (including Google AdSense). These partners may use cookies to serve relevant ads. No sensitive data is shared.",
        },
        {
          title: "5. Your rights",
          text: "In accordance with applicable regulations (including GDPR), you have the right to access, correct and delete your data. For any request, contact us via the Contact page.",
        },
        {
          title: "6. Contact",
          text: "For any question about this privacy policy, you can write to us from the site's Contact page.",
        },
      ],
    },
}

export const dictionaries: Record<Locale, Dictionary> = { fr, en }
