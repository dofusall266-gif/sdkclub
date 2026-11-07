---
title: "Les paires cachées au sudoku : la technique expliquée"
seoTitle: "Paires cachées au sudoku : technique expliquée"
description: "Les paires cachées réservent deux chiffres à deux cases d'une zone, même noyés parmi d'autres candidats. Comment les repérer et éliminer les autres notes."
level: "Avancé"
next: "x-wing"
---

**En résumé** : si deux chiffres n'ont de place possible que dans les **deux mêmes cases** d'une ligne, d'une colonne ou d'un bloc, ces deux cases leur sont réservées. Tous les autres candidats de ces deux cases peuvent être retirés.

## Le principe

Prenez une ligne et examinez où peuvent aller le 2 et le 8. Imaginons que le 2 ne puisse aller que dans deux cases A et B de cette ligne, et que le 8 ne puisse aller que dans ces mêmes cases A et B. Alors A et B contiendront le 2 et le 8, dans un ordre ou dans l'autre.

Si A avait pour notes 2, 5, 8 et 9, elle ne peut en réalité être que 2 ou 8 : les candidats 5 et 9 sont impossibles et on les efface. Même chose pour B.

C'est une paire « cachée » parce que les deux chiffres sont noyés au milieu d'autres candidats : on ne les voit pas au premier coup d'œil, contrairement à la [paire nue](/techniques/paires-nues) où les deux cases n'ont que deux notes.

## Comment les repérer

1. Dans une zone, comptez pour chaque chiffre le **nombre de cases où il est encore possible**.
2. Cherchez deux chiffres qui n'ont chacun que deux cases possibles, **les mêmes**.
3. Dans ces deux cases, supprimez tous les autres candidats.

Astuce : une paire cachée est plus facile à voir sur un **bloc ou une ligne presque rempli** : il reste peu de cases vides, donc peu de places possibles pour chaque chiffre.

## Triplets cachés

Le même raisonnement fonctionne avec trois chiffres : s'ils n'ont de place que dans trois mêmes cases, ces trois cases leur sont réservées. C'est plus difficile à repérer, mais la logique est identique.

## Erreurs fréquentes

- Confondre avec deux chiffres qui partagent seulement **une** case.
- Oublier de vérifier que les deux chiffres sont absents du reste de la zone.
- Effacer les deux chiffres de la paire au lieu des **autres** candidats.

## Pour aller plus loin

Les paires et triplets cachés apparaissent dès le niveau [Difficile](/sudoku-difficile). Ils préparent aux motifs plus avancés comme le [X-Wing](/techniques/x-wing) et le [Y-Wing](/techniques/y-wing), qui ont leur propre entraînement interactif.
