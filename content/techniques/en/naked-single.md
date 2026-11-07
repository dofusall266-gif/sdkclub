---
title: "The naked single in sudoku: the basic technique"
seoTitle: "Naked single in sudoku: the basic technique"
description: "The naked single is the first technique to master in sudoku: how to spot a cell that has only one possible digit, with examples."
level: "Beginner"
next: "naked-pairs"
---

**In short**: a naked single is an empty cell where, once you have removed the digits already in its row, its column and its 3×3 box, only one digit is left. It is the basic technique, the one that solves easy puzzles.

## How to spot a naked single

Take an empty cell and look at the three zones it belongs to: its row, its column and its box. Note the digits already placed in those three zones. The digits that appear in none of them are the cell's candidates.

An example: the row contains 1, 4 and 7, the column contains 2, 3 and 9, and the box contains 5 and 6. Together they cover 1, 2, 3, 4, 5, 6, 7 and 9. Only **8** is missing, so the cell can only be 8. You can place it with confidence.

## The hidden single

There is a second form, just as useful, often called the hidden single. This time you look at a digit rather than a cell: in a row, column or box, that digit has **only one possible cell**, even if the cell has other candidates.

Example: in a box, the 7 is missing. The other empty cells of the box already see a 7 in their row or column. Only one cell remains free, so the 7 goes there, even if the cell could also have held a 2 or a 9.

## A method so you miss nothing

1. **Scan digit by digit.** Pick 1, find where it is already placed, then look at the boxes where it is missing. The rows and columns already holding a 1 close off cells. Then move on to 2, 3, and so on.
2. **Scan cell by cell** for the cells surrounded by many digits: they are the most likely to have a single candidate.
3. **Start again after every placement.** A placed digit changes the options in its row, column and box.

## Common mistakes

- Checking only two of the three zones (for example forgetting the box).
- Placing a digit that is "almost certain": a naked single is a certainty, not a probability.
- Not scanning again after a placement, and missing new naked singles.

## Keep practising

Almost all puzzles at the [easy sudoku](/sudoku-facile) level can be solved with this technique alone. When you finish them effortlessly, move on to [Medium](/sudoku-moyen) and discover [pointing pairs](/techniques/pointage) and [naked pairs](/techniques/paires-nues).
