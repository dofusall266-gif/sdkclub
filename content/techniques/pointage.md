---
title: "Le pointage au sudoku : la technique des paires et triplets pointants"
seoTitle: "Pointage au sudoku : technique expliquée"
description: "Le pointage (paires et triplets pointants) élimine des candidats quand un chiffre d'un bloc est aligné sur une seule ligne ou colonne. Explication illustrée."
level: "Intermédiaire"
next: "paires-cachees"
---

**En résumé** : quand, dans un bloc de 3×3, un chiffre n'a de place possible que sur **une seule ligne** (ou une seule colonne), il est forcément à cet endroit du bloc. On peut donc le retirer des autres cases de cette ligne (ou colonne), en dehors du bloc.

## Le principe

Regardez un bloc où le chiffre 4 n'est pas encore placé. Supposons que, dans ce bloc, toutes les cases où le 4 est encore possible se trouvent sur la même ligne. Le 4 de ce bloc ira forcément sur cette ligne.

Conséquence : dans le reste de cette ligne (les deux autres blocs), le 4 ne peut plus être placé, puisque la ligne ne contient qu'un seul 4 et qu'il est déjà « réservé » au bloc. On supprime donc le 4 des notes de ces cases.

On parle de **paire pointante** quand le chiffre n'a que deux places alignées dans le bloc, et de **triplet pointant** quand il en a trois.

## Comment repérer un pointage

1. Choisissez un chiffre et un bloc où il manque.
2. Notez ses cases possibles dans le bloc (avec les notes, c'est immédiat).
3. Si ces cases sont sur une même ligne ou une même colonne, vous avez un pointage.
4. Retirez le chiffre des notes du reste de la ligne ou de la colonne.

## La version inverse : la réduction ligne-bloc

Le raisonnement fonctionne dans l'autre sens. Si, dans une **ligne**, un chiffre n'a de place possible que dans un seul bloc, alors ce chiffre est dans ce bloc, et on peut le retirer des autres cases du bloc qui sont dans d'autres lignes. On l'appelle parfois « claiming » en anglais.

## Erreurs fréquentes

- Retirer le chiffre des cases du bloc lui-même : l'élimination se fait uniquement **en dehors du bloc**.
- Ne pas tenir compte des chiffres déjà posés, qui réduisent déjà les cases possibles.
- Chercher un pointage sans notes : il est très difficile à voir de tête.

## Pour s'entraîner

Le pointage sert dans la grande majorité des grilles du niveau [Moyen](/sudoku-moyen). Il se combine souvent avec les [paires nues](/techniques/paires-nues) pour débloquer une grille, avant de passer aux techniques avancées comme le [X-Wing](/techniques/x-wing).
