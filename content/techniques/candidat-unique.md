---
title: "Le candidat unique au sudoku : la technique de base"
seoTitle: "Candidat unique au sudoku : la technique de base"
description: "Le candidat unique est la première technique à maîtriser au sudoku : comment repérer une case qui n'a qu'un seul chiffre possible, avec des exemples."
level: "Débutant"
next: "paires-nues"
---

**En résumé** : un candidat unique est une case vide où, une fois éliminés les chiffres déjà présents dans sa ligne, sa colonne et son bloc de 3×3, il ne reste qu'un seul chiffre possible. C'est la technique de base, celle qui résout les grilles faciles.

## Comment repérer un candidat unique

Prenez une case vide et regardez les trois zones auxquelles elle appartient : sa ligne, sa colonne et son bloc. Notez les chiffres déjà posés dans ces trois zones. Le ou les chiffres qui n'apparaissent dans aucune d'elles sont les candidats de la case.

Un exemple : la ligne contient 1, 4 et 7, la colonne contient 2, 3 et 9, le bloc contient 5 et 6. À eux trois, ces chiffres couvrent 1, 2, 3, 4, 5, 6, 7 et 9. Il ne manque que le **8** : la case ne peut contenir que lui. Vous pouvez le poser sans hésiter.

## Le chiffre unique d'une zone

Il existe une seconde forme, tout aussi utile, qu'on appelle parfois le candidat caché. Cette fois, on ne regarde plus une case mais un chiffre : dans une ligne, une colonne ou un bloc, ce chiffre n'a **qu'une seule case possible**, même si cette case a d'autres candidats.

Exemple : dans un bloc, il manque le 7. Les autres cases vides du bloc voient déjà un 7 dans leur ligne ou leur colonne. Une seule case reste libre : c'est là que va le 7, même si elle pouvait aussi accueillir un 2 ou un 9.

## Une méthode pour ne rien rater

1. **Balayez chiffre par chiffre.** Choisissez le 1, repérez où il est déjà placé, puis cherchez les blocs où il manque. Les lignes et colonnes déjà occupées par un 1 ferment des cases. Passez ensuite au 2, au 3, etc.
2. **Balayez case par case** pour les cases entourées de nombreux chiffres : ce sont les plus susceptibles de n'avoir qu'un candidat.
3. **Recommencez après chaque placement.** Un chiffre posé change les possibilités de sa ligne, de sa colonne et de son bloc.

## Erreurs fréquentes

- Ne regarder que deux zones sur trois (par exemple oublier le bloc).
- Poser un chiffre « presque sûr » : un candidat unique est une certitude, pas une probabilité.
- Ne pas recommencer le balayage après un placement, et passer à côté de nouveaux candidats uniques.

## Pour s'entraîner

Les grilles du niveau [Sudoku facile](/sudoku-facile) se résolvent presque toutes avec cette seule technique. Quand vous les terminez sans effort, passez au niveau [Moyen](/sudoku-moyen) et découvrez le [pointage](/techniques/pointage) et les [paires nues](/techniques/paires-nues).
