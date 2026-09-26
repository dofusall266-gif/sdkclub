---
title: "La technique du Swordfish en sudoku : le grand frère du X-Wing"
date: "2026-03-24"
excerpt: "Sur les grilles les plus difficiles, même le X-Wing ne suffit plus. Le Swordfish applique le même principe à trois lignes et trois colonnes à la fois. Explication et exemple."
category: "Technique"
---

Si vous avez déjà pris l'habitude de repérer des [X-Wing](/blog/technique-x-wing) dans vos grilles, le **Swordfish** ne devrait pas vous dépayser : c'est exactement le même principe logique, simplement étendu de deux à trois lignes (ou colonnes). C'est une des techniques les plus avancées qu'on puisse rencontrer sur une grille **Expert**, et elle suffit souvent, à elle seule, à débloquer une grille qui semblait complètement figée.

## Rappel rapide du principe du X-Wing

Le X-Wing repose sur deux lignes où un même chiffre n'a que deux positions possibles, situées dans les deux mêmes colonnes. Ce verrouillage permet d'éliminer ce chiffre partout ailleurs dans ces deux colonnes. Le Swordfish applique la même logique, mais avec **trois lignes et trois colonnes**.

## Le principe du Swordfish

On cherche cette fois **trois lignes** dans lesquelles un même chiffre — disons le 6 — ne peut se placer que dans un ensemble de **trois colonnes en tout** (chaque ligne n'ayant pas nécessairement ses trois candidats sur les trois colonnes : deux suffisent, tant que l'ensemble des colonnes utilisées par les trois lignes ne dépasse pas trois colonnes au total).

Par exemple :
- **Ligne 1** : le 6 n'est possible qu'en colonnes 2 et 5.
- **Ligne 4** : le 6 n'est possible qu'en colonnes 2 et 8.
- **Ligne 7** : le 6 n'est possible qu'en colonnes 5 et 8.

À elles trois, ces lignes ne couvrent que **trois colonnes** : 2, 5 et 8 — même si aucune ligne, individuellement, ne les couvre toutes les trois. C'est exactement la configuration recherchée.

## Pourquoi ça fonctionne

Le raisonnement est le même que pour le X-Wing, simplement un cran plus complexe à visualiser : le chiffre 6 doit apparaître une fois dans chacune des lignes 1, 4 et 7. Dans chaque cas, il ne peut se loger que dans les colonnes 2, 5 ou 8. Comme il y a exactement trois lignes pour exactement trois colonnes disponibles, la seule façon de satisfaire toutes les contraintes est que chacune des colonnes 2, 5 et 8 reçoive **exactement un** 6, réparti entre les trois lignes.

Conséquence : dans les colonnes 2, 5 et 8, le chiffre 6 ne peut plus apparaître dans **aucune autre ligne** que 1, 4 ou 7. On peut donc effacer ce candidat de toutes les autres cases de ces trois colonnes — un gain souvent suffisant pour révéler une case résolvable par élimination simple juste après.

## Comment le repérer sans se perdre

Le Swordfish a mauvaise réputation parce qu'il demande de suivre trois lignes et trois colonnes en même temps — mais la méthode reste la même que pour le X-Wing, juste répétée une fois de plus :

1. Choisissez un chiffre candidat à la fois.
2. Repérez les lignes où ce chiffre a seulement 2 ou 3 positions possibles.
3. Cherchez trois de ces lignes dont l'ensemble des colonnes couvertes ne dépasse pas trois colonnes au total.
4. Effacez ce candidat de ces trois colonnes, dans toutes les autres lignes.

**Astuce pratique** : n'essayez pas de repérer un Swordfish « à l'œil » directement sur toute la grille. Listez d'abord, pour un chiffre donné, toutes les lignes qui n'ont que 2 ou 3 candidats possibles — cette liste réduite rend la recherche des trois bonnes lignes beaucoup plus gérable.

## Le Swordfish n'est pas la fin de l'histoire

Le même principe peut théoriquement continuer avec quatre lignes et quatre colonnes (une technique appelée *Jellyfish*), mais ces configurations deviennent extrêmement rares en pratique — la plupart des grilles, même en difficulté Expert, se résolvent sans jamais avoir besoin d'aller au-delà du Swordfish. Si vous maîtrisez le X-Wing et le Swordfish, vous disposez déjà des deux techniques les plus utiles pour venir à bout des grilles les plus exigeantes.

Retrouvez toutes nos autres techniques de résolution, du niveau débutant au niveau expert, sur notre [page dédiée aux techniques](/techniques).
