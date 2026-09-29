---
title: "The X-Wing technique in sudoku: how to use it (with example)"
date: "2026-03-10"
excerpt: "Stuck on a hard puzzle once all the basic techniques are exhausted? The X-Wing is often the key. Step-by-step explanation, with a concrete example."
category: "Technique"
faq:
  - q: "Does the X-Wing work with any digit?"
    a: "Yes, but one digit at a time: you spot an X-Wing by checking candidates one at a time (1, then 2, then 3...), never by looking at several digits at once."
  - q: "Does the X-Wing guarantee solving a cell right away?"
    a: "Not necessarily. It eliminates candidates, which often — but not always instantly — unlocks another cell by simple elimination right afterward."
  - q: "What technique should I learn after the X-Wing?"
    a: "The Swordfish, which applies the exact same reasoning to three rows and three columns."
---

**In short**: the X-Wing lets you eliminate a candidate when a given digit has only two possible positions in two rows, located in exactly the same two columns (or the reverse, by columns). This lock forces that candidate out of every other cell in those two columns.

If you regularly play at **Hard** or **Expert** difficulty, you've probably experienced this frustrating moment: the grid seems stuck, no cell has an obvious single possibility, and yet it isn't finished. This is very often a sign that you need to move past basic techniques and use what's called an "elimination" technique, like the **X-Wing**.

## A prerequisite: playing with candidate notes

The X-Wing doesn't apply directly to a digit you place, but to **candidates** — the small notes listing, for each empty cell, which digits are still possible. If you're not using them yet, now's the time: on Sudoku Club, turn on "Notes" mode (the pencil icon in the toolbar) to jot down, in every empty cell, all the digits that could theoretically go there. It's on this map of candidates that the X-Wing pattern becomes visible.

## The principle behind the X-Wing

The X-Wing focuses on **one digit at a time** — let's call it 4 for this example. The idea: look for two rows in which the digit 4 has only **two possible positions**, where those two positions fall, in both rows, in **exactly the same columns**.

Concretely, imagine that:
- In **row 2**, the digit 4 can only go in column 3 or column 7.
- In **row 6**, the digit 4 can *also* only go in column 3 or column 7.

These four cells (R2C3, R2C7, R6C3, R6C7) form a rectangle — that's the shape that gives the "X-Wing" its name.

## Why this lets you eliminate candidates

Here's the logical reasoning: the digit 4 must appear once in row 2, and once in row 6. In both cases, it can only go in column 3 or column 7. There are only two ways to place these two 4s:

- 4 in R2C3 and 4 in R6C7, **or**
- 4 in R2C7 and 4 in R6C3.

In both possible scenarios, **each of columns 3 and 7 gets exactly one 4**, coming from one of the two rows. But a column can only contain a single 4. Direct consequence: **the digit 4 can no longer appear anywhere else in columns 3 and 7**, nor in any other row of those columns.

So you can erase the candidate 4 from every other cell in columns 3 and 7 (outside rows 2 and 6, of course) — even without knowing yet *which* of the two scenarios is correct. That's the whole strength of this technique: it doesn't tell you where to place a digit, but it eliminates possibilities elsewhere, which often unlocks another cell by simple elimination.

## The "reversed" version: X-Wing by columns

The same reasoning works starting from two **columns** instead of two rows: if a digit only has two possible positions across two different columns, and those positions fall on the same two rows, you can then eliminate that digit from the rest of those two rows. It's the exact same principle, simply rotated 90 degrees.

## How to spot it efficiently

In practice, spotting an X-Wing by eye on a full grid can be tedious. The most efficient method:

1. Pick one digit at a time (start with the ones that look most constrained).
2. Find every row where that digit has only two possible candidates.
3. Compare their columns: as soon as two rows share exactly the same two columns, you have an X-Wing.
4. Erase that candidate everywhere else in those two columns.

## A technique to combine with others

The X-Wing belongs to a family of techniques known as "locked candidates," alongside even more advanced techniques like the [**Swordfish**](/blog/technique-swordfish) — its big brother, which applies the same principle to three rows and three columns at once instead of two. Once the X-Wing becomes second nature, the Swordfish will be much easier to understand.

Find our other solving techniques, from beginner to expert level, on our [dedicated techniques page](/techniques), and put them into practice on an [Expert puzzle](/jouer?niveau=expert).
