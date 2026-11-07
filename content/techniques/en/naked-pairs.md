---
title: "Naked pairs in sudoku: how to spot and use them"
seoTitle: "Naked pairs in sudoku: spot and use them"
description: "Naked pairs let you eliminate candidates when two cells in a zone can only hold the same two digits. Explanation with examples."
level: "Intermediate"
next: "pointage"
---

**In short**: if two cells in the same row, column or box can only contain the same two digits, those two digits are reserved for them. You can then remove them from the other cells of the zone.

## The principle

Imagine two cells in a row whose notes are exactly **3 and 7**. You do not know which one takes the 3 and which takes the 7, but you know these two cells will share those two digits. So there is no room left for a 3 or a 7 anywhere else in the row.

Another cell in the row has notes 3, 5 and 7? Its candidates 3 and 7 are impossible: only **5** is left, and you can place it.

## How to spot a naked pair

1. Keep your **notes** up to date: without them, naked pairs are invisible.
2. Look in a zone for cells that have only **two candidates**.
3. If two of those cells have exactly the same two candidates, that is a naked pair.
4. Remove those two digits from all the other cells of the same zone.

A naked pair can also sit at the intersection of two zones: two cells in the same box *and* the same row. In that case the elimination applies to both zones.

## Naked pair, naked triple

The reasoning extends: three cells in a zone whose candidates are all taken from the same three digits form a **naked triple**. The three digits are reserved for those three cells and disappear from the rest of the zone. The cells do not each need to hold all three digits: {1, 2}, {2, 3} and {1, 3} form a naked triple.

## Common mistakes

- Confusing it with two cells that *each* have the same two digits **among others**: if one cell has a third candidate, it is not a naked pair.
- Removing the digits from cells outside the shared zone.
- Forgetting to check all three types of zone (row, column, box).

## Going further

Naked pairs appear from the [Medium](/sudoku-moyen) level and become common at [Hard](/sudoku-difficile). Their "reverse" version is the [hidden pairs](/techniques/paires-cachees) technique.
