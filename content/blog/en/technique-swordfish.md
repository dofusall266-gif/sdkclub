---
title: "The Swordfish technique in sudoku: the X-Wing's big brother"
date: "2026-03-24"
excerpt: "On the hardest puzzles, even the X-Wing isn't enough anymore. The Swordfish applies the same principle to three rows and three columns at once. Explanation and example."
category: "Technique"
faq:
  - q: "Does the Swordfish require all three rows to each have three candidates?"
    a: "No. Each row can have just 2 or 3 candidates — what matters is that the total set of columns covered by the three rows doesn't exceed three columns."
  - q: "Is the Swordfish rarer than the X-Wing?"
    a: "Yes, notably — it requires a more specific configuration. But on Expert puzzles, it's often enough on its own to unlock a puzzle that seemed completely stuck."
  - q: "Is there an even more advanced technique?"
    a: "Yes, the Jellyfish (four rows and four columns), but it remains extremely rare in practice — the Swordfish already covers the vast majority of cases."
---

**In short**: the Swordfish extends the X-Wing principle to three rows and three columns instead of two — as soon as three rows contain the same digit limited to a total of three columns, that digit can be eliminated everywhere else in those three columns.

If you've already gotten used to spotting [X-Wings](/blog/technique-x-wing) in your puzzles, the **Swordfish** shouldn't feel unfamiliar: it's the exact same logical principle, simply extended from two to three rows (or columns). It's one of the most advanced techniques you'll come across on an **Expert** puzzle, and it's often enough, on its own, to unlock a grid that seemed completely stuck.

## A quick reminder of the X-Wing principle

The X-Wing relies on two rows where the same digit only has two possible positions, located in the same two columns. This lock lets you eliminate that digit everywhere else in those two columns. The Swordfish applies the same logic, but with **three rows and three columns**.

## The Swordfish principle

This time, we're looking for **three rows** in which the same digit — let's say 6 — can only go in a set of **three columns total** (each row doesn't necessarily need all three candidates across all three columns: two is enough, as long as the total set of columns used by the three rows doesn't exceed three).

For example:
- **Row 1**: the 6 is only possible in columns 2 and 5.
- **Row 4**: the 6 is only possible in columns 2 and 8.
- **Row 7**: the 6 is only possible in columns 5 and 8.

Together, these three rows only cover **three columns**: 2, 5, and 8 — even though no single row, on its own, covers all three. That's exactly the configuration we're looking for.

## Why it works

The reasoning is the same as for the X-Wing, just one notch more complex to visualize: the digit 6 must appear once in each of rows 1, 4, and 7. In each case, it can only go in columns 2, 5, or 8. Since there are exactly three rows for exactly three available columns, the only way to satisfy every constraint is for each of columns 2, 5, and 8 to receive **exactly one** 6, spread across the three rows.

Consequence: in columns 2, 5, and 8, the digit 6 can no longer appear in **any row other than** 1, 4, or 7. So you can erase that candidate from every other cell in those three columns — a gain that's often enough to reveal a cell solvable by simple elimination right afterward.

## How to spot it without getting lost

The Swordfish has a reputation for being tricky because it requires tracking three rows and three columns at once — but the method stays the same as for the X-Wing, just repeated once more:

1. Pick one candidate digit at a time.
2. Find the rows where that digit has only 2 or 3 possible positions.
3. Look for three of those rows whose combined set of columns doesn't exceed three columns total.
4. Erase that candidate from those three columns, in every other row.

**Practical tip**: don't try to spot a Swordfish "by eye" directly on the whole grid. First list, for a given digit, every row that has only 2 or 3 possible candidates — this shorter list makes finding the right three rows much more manageable.

## The Swordfish isn't the end of the story

The same principle can theoretically continue with four rows and four columns (a technique called *Jellyfish*), but these configurations become extremely rare in practice — most puzzles, even at Expert difficulty, get solved without ever needing to go beyond the Swordfish. If you've mastered the X-Wing and the Swordfish, you already have the two most useful techniques for cracking the most demanding puzzles.

Find all our other solving techniques, from beginner to expert level, on our [dedicated techniques page](/techniques), and practice them directly on an [Expert puzzle](/jouer?niveau=expert).
