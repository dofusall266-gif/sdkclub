---
title: "Pointing pairs in sudoku: the technique explained"
seoTitle: "Pointing pairs in sudoku: explained"
description: "Pointing pairs and triples eliminate candidates when a digit in a box is lined up on a single row or column. Illustrated explanation."
level: "Intermediate"
next: "paires-cachees"
---

**In short**: when, in a 3×3 box, a digit can only go on **a single row** (or a single column), it must be somewhere on that line within the box. You can therefore remove it from the other cells of that row (or column), outside the box.

## The principle

Look at a box where the digit 4 is not yet placed. Suppose that, in this box, all the cells where 4 is still possible are on the same row. The 4 of this box must go on that row.

Consequence: in the rest of that row (the two other boxes), the 4 can no longer be placed, since a row holds only one 4 and it is already "reserved" for the box. So you remove the 4 from the notes of those cells.

It is called a **pointing pair** when the digit has only two aligned spots in the box, and a **pointing triple** when it has three.

## How to spot a pointing pair

1. Choose a digit and a box where it is missing.
2. Note its possible cells in the box (with notes, this is immediate).
3. If those cells are on the same row or column, you have a pointing pair.
4. Remove the digit from the notes in the rest of the row or column.

## The reverse version: box-line reduction

The reasoning also works the other way round. If, in a **row**, a digit can only go in a single box, then that digit is in that box, and you can remove it from the other cells of the box that lie on other rows. It is sometimes called "claiming".

## Common mistakes

- Removing the digit from the cells of the box itself: the elimination happens only **outside the box**.
- Ignoring digits already placed, which already reduce the possible cells.
- Looking for a pointing pair without notes: it is very hard to see in your head.

## Keep practising

Pointing pairs are used in the vast majority of [Medium](/sudoku-moyen) puzzles. They are often combined with [naked pairs](/techniques/paires-nues) to unlock a puzzle, before moving on to advanced techniques such as the [X-Wing](/techniques/x-wing).
