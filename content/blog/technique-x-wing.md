---
title: "La technique du X-Wing en sudoku : comment l'utiliser (avec exemple)"
date: "2026-03-10"
excerpt: "Bloqué sur une grille difficile alors que toutes les techniques de base sont épuisées ? Le X-Wing est souvent la clé. Explication pas à pas, avec un exemple concret."
category: "Technique"
---

Si vous jouez régulièrement en difficulté **Difficile** ou **Expert**, vous avez probablement déjà vécu ce moment frustrant : la grille semble bloquée, aucune case n'a une seule possibilité évidente, et pourtant elle n'est pas terminée. C'est très souvent le signe qu'il faut sortir des techniques de base et passer à une technique dite « d'élimination », comme le **X-Wing**.

## Un prérequis : jouer avec les annotations

Le X-Wing ne s'applique pas directement à un chiffre qu'on pose, mais aux **candidats** — les petites annotations qui listent, pour chaque case vide, les chiffres encore possibles. Si vous ne les utilisez pas encore, c'est le moment : sur Sudoku Club, activez le mode « Notes » (le crayon dans la barre d'outils) pour noter, dans chaque case vide, tous les chiffres qui pourraient théoriquement y aller. C'est sur cette carte de candidats que le X-Wing va se repérer.

## Le principe du X-Wing

Le X-Wing s'intéresse à **un seul chiffre à la fois** — appelons-le 4 pour l'exemple. L'idée : chercher deux lignes dans lesquelles le chiffre 4 n'a que **deux emplacements possibles**, et où ces deux emplacements se trouvent, dans les deux lignes, **exactement dans les mêmes colonnes**.

Concrètement, imaginons que :
- Dans la **ligne 2**, le chiffre 4 ne peut aller qu'en colonne 3 ou colonne 7.
- Dans la **ligne 6**, le chiffre 4 ne peut aller *aussi* qu'en colonne 3 ou colonne 7.

Ces quatre cases (L2C3, L2C7, L6C3, L6C7) forment un rectangle — c'est cette forme qui donne son nom au « X-Wing ».

## Pourquoi ça permet d'éliminer des candidats

Voici le raisonnement logique : le chiffre 4 doit obligatoirement apparaître une fois dans la ligne 2, et une fois dans la ligne 6. Dans les deux cas, il ne peut aller qu'en colonne 3 ou en colonne 7. Il n'y a que deux façons de placer ces deux 4 :

- 4 en L2C3 et 4 en L6C7, **ou**
- 4 en L2C7 et 4 en L6C3.

Dans les deux scénarios possibles, **chacune des colonnes 3 et 7 reçoit exactement un 4**, venant de l'une des deux lignes. Or une colonne ne peut contenir qu'un seul 4. Conséquence directe : **le chiffre 4 ne peut plus apparaître nulle part ailleurs dans les colonnes 3 et 7**, ni dans les autres lignes de ces colonnes.

On peut donc effacer le candidat 4 de toutes les autres cases des colonnes 3 et 7 (en dehors des lignes 2 et 6, bien sûr) — même si on ne sait pas encore *lequel* des deux scénarios est le bon. C'est toute la force de cette technique : elle n'indique pas où placer un chiffre, mais elle élimine des possibilités ailleurs, ce qui débloque souvent la résolution d'une autre case par simple élimination.

## La version « inversée » : X-Wing par colonnes

Le même raisonnement fonctionne en partant de deux **colonnes** plutôt que deux lignes : si un chiffre n'a que deux positions possibles dans deux colonnes différentes, et que ces positions tombent sur les deux mêmes lignes, on peut alors éliminer ce chiffre du reste de ces deux lignes. C'est exactement le même principe, simplement appliqué à 90 degrés.

## Comment le repérer efficacement

En pratique, repérer un X-Wing à l'œil nu sur une grille complète peut être fastidieux. La méthode la plus efficace :

1. Choisissez un chiffre à la fois (commencez par ceux qui semblent les plus contraints).
2. Repérez toutes les lignes où ce chiffre n'a que deux candidats possibles.
3. Comparez leurs colonnes : dès que deux lignes partagent exactement les deux mêmes colonnes, vous avez un X-Wing.
4. Effacez ce candidat partout ailleurs dans ces deux colonnes.

## Une technique à combiner avec d'autres

Le X-Wing fait partie d'une famille de techniques dites « à motifs de verrouillage » (*locked candidates*), aux côtés de techniques encore plus avancées comme le **Swordfish** — son grand frère, qui applique le même principe à trois lignes et trois colonnes à la fois plutôt que deux. Si le X-Wing devient un réflexe, le Swordfish sera beaucoup plus facile à comprendre.

Retrouvez d'autres techniques de résolution, du niveau débutant au niveau expert, sur notre [page dédiée aux techniques](/techniques).
