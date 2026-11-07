---
title: "Les paires nues au sudoku : comment les repérer et les utiliser"
seoTitle: "Paires nues au sudoku : repérer et utiliser"
description: "Les paires nues permettent d'éliminer des candidats quand deux cases d'une même zone n'ont que les deux mêmes chiffres possibles. Explication avec exemples."
level: "Intermédiaire"
next: "pointage"
---

**En résumé** : si deux cases d'une même ligne, colonne ou bloc ne peuvent contenir que les deux mêmes chiffres, ces deux chiffres leur sont réservés. On peut alors les retirer des autres cases de la zone.

## Le principe

Imaginez deux cases d'une même ligne dont les notes sont exactement **3 et 7**. On ne sait pas laquelle prend le 3 et laquelle prend le 7, mais on sait que ces deux cases se partageront ces deux chiffres. Il ne reste donc plus de place pour un 3 ni pour un 7 ailleurs dans la ligne.

Une autre case de la ligne a pour notes 3, 5 et 7 ? Ses candidats 3 et 7 sont impossibles : il ne reste que le **5**, qu'on peut poser.

## Comment repérer une paire nue

1. Tenez vos **notes** à jour : sans elles, les paires nues sont invisibles.
2. Cherchez dans une zone les cases qui n'ont que **deux candidats**.
3. Si deux de ces cases ont exactement les mêmes deux candidats, c'est une paire nue.
4. Retirez ces deux chiffres de toutes les autres cases de la même zone.

Une paire nue peut aussi se situer à l'intersection de deux zones : deux cases d'un même bloc *et* d'une même ligne. Dans ce cas, l'élimination vaut pour les deux zones.

## Paire nue, triplet nu

Le raisonnement s'étend : trois cases d'une zone dont les candidats sont tous pris parmi trois mêmes chiffres forment un **triplet nu**. Les trois chiffres sont réservés à ces trois cases et disparaissent du reste de la zone. Les cases du triplet n'ont pas besoin de contenir les trois chiffres chacune : {1, 2}, {2, 3} et {1, 3} forment un triplet nu.

## Erreurs fréquentes

- Confondre avec deux cases qui ont *chacune* les deux mêmes chiffres **parmi d'autres** : si une des cases a un troisième candidat, ce n'est pas une paire nue.
- Retirer les chiffres de cases situées hors de la zone commune.
- Oublier de vérifier les trois types de zones (ligne, colonne, bloc).

## Pour aller plus loin

Les paires nues apparaissent dès le niveau [Moyen](/sudoku-moyen) et deviennent courantes au niveau [Difficile](/sudoku-difficile). Leur version « inverse » est la technique des [paires cachées](/techniques/paires-cachees).
