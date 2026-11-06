---
title: "The Y-Wing (XY-Wing) technique in sudoku: spotting the pivot and its two wings"
date: "2026-11-01"
excerpt: "Three cells with two candidates are enough to unlock a grid. The Y-Wing, or XY-Wing, is quick to spot once you know the principle. Explanation and illustrated example."
category: "Technique"
---

**In short**: the Y-Wing uses three cells that each hold only two candidates: a **pivot** (A, B) and two **wings** (A, C) and (B, C) that both see the pivot. Whatever the pivot's value, one of the wings is C, so C can be eliminated from every cell that sees both wings.

When a grid looks stuck and singles, alignments and pairs give nothing more, the **Y-Wing** (also called **XY-Wing**) is often the next technique to try. It needs no long reasoning and no tracking of one digit at a time like the [X-Wing](/blog/technique-x-wing): you only have to spot three two-candidate cells.

> **Want to practise right away?** [The illustrated Y-Wing lesson and exercises](/techniques/y-wing) put you in real grid situations with all notes shown: your job is to find the pivot and the wings.

## The principle in three cells

A Y-Wing is made of:
- **a pivot** holding exactly two candidates, say A and B;
- **a first wing** holding A and a third digit C;
- **a second wing** holding B and the same digit C.

Each wing must **see the pivot**: be in its row, column or box. The wings do not have to see each other.

![Diagram of a Y-Wing on a sudoku grid: the pivot and its two wings are coloured, the eliminated candidate is crossed out in red](/blog/diagram-y-wing.webp)

*Y-Wing example: the three pattern cells are in green, the candidate to remove is crossed out in red.*

## Why it works

Reason on the pivot, which must be A or B:
- **if it is A**, the wing holding A cannot be A (it sees the pivot), so it is C;
- **if it is B**, the other wing cannot be B, so it is C.

Either way, **one of the two wings is C**. Any cell seeing both wings cannot hold C, so you can remove that candidate from its notes without knowing which case is the real one.

## How to spot it

1. **Fill in the notes**: the Y-Wing is only visible on candidates.
2. **List the two-candidate cells**, then pick one as a possible pivot.
3. **Look for its two wings** in its row, column and box: one with A and C, one with B and C.
4. **Check the cells that see both wings**: if one holds C, you just earned an elimination.

## Mistakes to avoid

- Using wings that do not see the pivot.
- Picking two wings with the same digits: you need (A, C) and (B, C).
- Removing C from a cell that sees only one of the two wings.

## Going further

The Y-Wing is a good companion to the [X-Wing](/blog/technique-x-wing) and the [Swordfish](/blog/technique-swordfish). Find every technique, from the basics to the most advanced, in our [sudoku techniques guide](/blog/guide-techniques-sudoku) and on the [Techniques](/techniques) page.

## Frequently asked questions

**What is the difference between Y-Wing and XY-Wing?**
None: they are two names for the same technique.

**Is the Y-Wing harder than the X-Wing?**
Not necessarily: it relies on two-candidate cells, which are easy to spot, while the X-Wing means following a single digit across the whole grid.

**At which level do you meet it?**
Mostly at Expert level and beyond: easier grids are solved with simpler techniques.
