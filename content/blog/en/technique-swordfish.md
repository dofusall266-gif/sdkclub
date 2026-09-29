---
title: "The Swordfish technique in sudoku: X-Wing's big brother"
date: "2026-03-24"
excerpt: "On the hardest grids, even the X-Wing isn't enough. The Swordfish applies the same principle to three rows and three columns at once. Explanation and example."
category: "Technique"
---

**In short**: the Swordfish extends the X-Wing principle to three rows and three columns instead of two — whenever three rows contain the same digit confined to a total of three columns, that digit can be eliminated everywhere else in those three columns.

If you've already gotten into the habit of spotting [X-Wings](/blog/technique-x-wing) in your grids, the **Swordfish** shouldn't feel unfamiliar: it's exactly the same logical principle, simply extended from two to three rows (or columns). It's one of the most advanced techniques you can run into on an **Expert** grid, and it is often enough, on its own, to unlock a grid that seemed completely stuck.

## A quick reminder of the X-Wing principle

The X-Wing relies on two rows where a given digit has only two possible positions, located in the same two columns. This lock allows you to eliminate that digit everywhere else in those two columns. The Swordfish applies the same logic, but with **three rows and three columns**.

## The Swordfish principle

This time we look for **three rows** in which a given digit — say 6 — can only be placed within a set of **three columns in total** (each row doesn't necessarily have its candidates in all three columns: two are enough, as long as the set of columns used by the three rows doesn't exceed three columns in total).

For example:
- **Row 1**: the 6 is only possible in columns 2 and 5.
- **Row 4**: the 6 is only possible in columns 2 and 8.
- **Row 7**: the 6 is only possible in columns 5 and 8.

Together, these rows cover only **three columns**: 2, 5 and 8 — even though no single row covers all three. That is exactly the configuration we're looking for.

## Why it works

The reasoning is the same as for the X-Wing, just one notch harder to visualize: the digit 6 must appear once in each of rows 1, 4 and 7. In each case, it can only go in columns 2, 5 or 8. Since there are exactly three rows for exactly three available columns, the only way to satisfy all the constraints is for each of columns 2, 5 and 8 to receive **exactly one** 6, spread across the three rows.

Consequence: in columns 2, 5 and 8, the digit 6 can no longer appear in **any row other than** 1, 4 or 7. You can therefore erase that candidate from all the other cells in those three columns — a gain that is often enough to reveal a cell solvable by simple elimination right afterwards.

## How to spot it without getting lost

The Swordfish has a bad reputation because it requires you to track three rows and three columns at the same time — but the method is the same as for the X-Wing, just repeated once more:

1. Pick one candidate digit at a time.
2. Find the rows where this digit has only 2 or 3 possible positions.
3. Look for three of those rows whose combined columns don't exceed three columns in total.
4. Erase that candidate from those three columns, in all the other rows.

**Practical tip**: don't try to spot a Swordfish "by eye" directly across the whole grid. First list, for a given digit, all the rows that have only 2 or 3 possible candidates — this reduced list makes finding the three right rows much more manageable.

## The Swordfish isn't the end of the story

The same principle can theoretically continue with four rows and four columns (a technique called the *Jellyfish*), but these configurations become extremely rare in practice — most grids, even at Expert difficulty, can be solved without ever needing to go beyond the Swordfish. If you master the X-Wing and the Swordfish, you already have the two most useful techniques for tackling the most demanding grids.

## Frequently asked questions

**Does the Swordfish require all three rows to have three candidates each?**
No. Each row can have just 2 or 3 candidates — what matters is that the set of columns covered by the three rows doesn't exceed three columns in total.

**Is the Swordfish rarer than the X-Wing?**
Yes, markedly — it requires a more specific configuration. But on Expert grids, it is often enough, on its own, to unlock a grid that seemed stuck.

**Is there an even more advanced technique?**
Yes, the *Jellyfish* (four rows and four columns), but it remains extremely rare in practice — the Swordfish already covers the vast majority of cases.

Find all our other solving techniques, from beginner to expert level, on our [techniques page](/techniques), and practice directly on an [Expert grid](/jouer?niveau=expert).
