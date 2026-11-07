---
title: "Hidden pairs in sudoku: the technique explained"
seoTitle: "Hidden pairs in sudoku: technique explained"
description: "Hidden pairs reserve two digits for two cells of a zone, even when buried among other candidates. How to spot them and remove the other notes."
level: "Advanced"
next: "x-wing"
---

**In short**: if two digits can only go in the **same two cells** of a row, column or box, those two cells are reserved for them. All the other candidates in those two cells can be removed.

## The principle

Take a row and look at where the 2 and the 8 can go. Suppose the 2 can only go in two cells A and B of this row, and the 8 can only go in those same cells A and B. Then A and B will hold the 2 and the 8, in one order or the other.

If A had notes 2, 5, 8 and 9, it can actually only be 2 or 8: the candidates 5 and 9 are impossible and you erase them. Same for B.

It is a "hidden" pair because the two digits are buried among other candidates: you do not see them at first glance, unlike the [naked pair](/techniques/paires-nues), where the two cells only have two notes.

## How to spot them

1. In a zone, count for each digit the **number of cells where it is still possible**.
2. Look for two digits that each have only two possible cells, **the same ones**.
3. In those two cells, delete all the other candidates.

Tip: a hidden pair is easier to see in a **nearly full box or row**: few empty cells remain, so each digit has few possible spots.

## Hidden triples

The same reasoning works with three digits: if they only have room in the same three cells, those three cells are reserved for them. It is harder to spot, but the logic is identical.

## Common mistakes

- Confusing it with two digits that share only **one** cell.
- Forgetting to check that both digits are absent from the rest of the zone.
- Erasing the two digits of the pair instead of the **other** candidates.

## Going further

Hidden pairs and triples appear from the [Hard](/sudoku-difficile) level. They prepare you for more advanced patterns such as the [X-Wing](/techniques/x-wing) and the [Y-Wing](/techniques/y-wing), which have their own interactive practice.
