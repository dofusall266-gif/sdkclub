---
title: "La technique du Y-Wing (XY-Wing) en sudoku : repérer le pivot et ses deux ailes"
seoTitle: "Technique Y-Wing au sudoku : le guide"
date: "2026-11-01"
excerpt: "Trois cases à deux candidats suffisent pour débloquer une grille. Le Y-Wing, ou XY-Wing, se repère en quelques secondes une fois qu'on connaît le principe. Explication et exemple illustré."
category: "Technique"
image: "/blog/technique-y-wing.webp"
technique: "y-wing"
---

**En résumé** : le Y-Wing utilise trois cases qui n'ont chacune que deux candidats : un **pivot** (A, B) et deux **ailes** (A, C) et (B, C) qui voient le pivot. Quelle que soit la valeur du pivot, une des deux ailes vaut C : on peut donc éliminer C de toutes les cases qui voient les deux ailes.

Quand une grille semble bloquée, que les chiffres uniques, les alignements et les paires ne donnent plus rien, le **Y-Wing** (aussi appelé **XY-Wing**) est souvent la technique suivante à essayer. Elle ne demande ni de longs raisonnements ni de chercher un chiffre à la fois comme le [X-Wing](/blog/technique-x-wing) : il suffit de repérer trois cases à deux candidats.

> **Envie de pratiquer tout de suite ?** [La leçon illustrée et les exercices sur le Y-Wing](/techniques/y-wing) vous placent dans de vraies situations de grille, avec toutes les notes affichées : à vous de trouver le pivot et les ailes.

## Le principe en trois cases

Un Y-Wing se compose de :
- **un pivot**, qui contient exactement deux candidats, par exemple A et B ;
- **une première aile**, qui contient A et un troisième chiffre C ;
- **une seconde aile**, qui contient B et le même chiffre C.

Les deux ailes doivent chacune **voir le pivot** : être dans sa ligne, sa colonne ou son bloc. Elles n'ont pas besoin de se voir entre elles.

![Schéma d'un Y-Wing sur une grille de sudoku : le pivot et ses deux ailes sont colorés, le candidat éliminé est barré en rouge](/blog/diagram-y-wing.webp)

*Exemple de Y-Wing : les trois cases du motif sont en vert, le candidat à retirer est barré en rouge.*

## Pourquoi ça marche

Raisonnons sur le pivot, qui vaut forcément A ou B :
- **s'il vaut A**, l'aile qui contient A ne peut plus valoir A (elle voit le pivot) : elle vaut donc C ;
- **s'il vaut B**, c'est l'autre aile qui ne peut plus valoir B : elle vaut donc C.

Dans les deux cas, **une des deux ailes vaut C**. Toute case qui voit à la fois les deux ailes ne peut donc pas contenir C, et vous pouvez retirer ce candidat de ses notes, sans savoir lequel des deux cas est le bon.

## Comment le repérer

1. **Remplissez les notes** : le Y-Wing ne se voit que sur les candidats.
2. **Listez les cases à deux candidats**, puis choisissez-en une comme pivot potentiel.
3. **Cherchez ses deux ailes** dans sa ligne, sa colonne et son bloc : une avec A et C, une avec B et C.
4. **Vérifiez les cases qui voient les deux ailes** : si l'une contient C, vous venez de gagner une élimination.

## Les erreurs à éviter

- Prendre des ailes qui ne voient pas le pivot.
- Choisir deux ailes avec les mêmes chiffres : il faut (A, C) et (B, C).
- Éliminer C d'une case qui ne voit qu'une seule des deux ailes.

## Aller plus loin

Le Y-Wing est un bon complément du [X-Wing](/blog/technique-x-wing) et du [Swordfish](/blog/technique-swordfish). Retrouvez toutes les techniques, des bases aux plus avancées, dans notre [guide des techniques de sudoku](/blog/guide-techniques-sudoku) et sur la page [Techniques](/techniques).

## Questions fréquentes

**Quelle est la différence entre Y-Wing et XY-Wing ?**
Aucune : ce sont deux noms de la même technique.

**Le Y-Wing est-il plus difficile que le X-Wing ?**
Pas nécessairement : il repose sur des cases à deux candidats, faciles à repérer, alors que le X-Wing demande de suivre un seul chiffre sur toute la grille.

**À partir de quel niveau le rencontre-t-on ?**
Surtout en Expert et au-delà : les grilles plus faciles se résolvent avec des techniques plus simples.
