/** Outils hors ligne pour fabriquer la banque de grilles (exécutés en Node, jamais dans le navigateur). */
import { logicSolve, type Technique } from "../lib/solver"

export function rng(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s |= 0
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Grille complète aléatoire (retour arrière avec candidats mélangés). */
export function randomSolution(r: () => number): number[] {
  const g = new Array(81).fill(0)
  const rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0)
  const fill = (i: number): boolean => {
    if (i === 81) return true
    const rr = Math.floor(i / 9), cc = i % 9, bb = Math.floor(rr / 3) * 3 + Math.floor(cc / 3)
    for (const d of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], r)) {
      const m = 1 << d
      if (rows[rr] & m || cols[cc] & m || boxes[bb] & m) continue
      g[i] = d; rows[rr] |= m; cols[cc] |= m; boxes[bb] |= m
      if (fill(i + 1)) return true
      g[i] = 0; rows[rr] &= ~m; cols[cc] &= ~m; boxes[bb] &= ~m
    }
    return false
  }
  fill(0)
  return g
}

/** Compte les solutions (jusqu'à `limit`) — sert de filet de sécurité final. */
export function countSolutions(puzzle: number[], limit = 2): number {
  const g = [...puzzle]
  const rows = new Array(9).fill(0), cols = new Array(9).fill(0), boxes = new Array(9).fill(0)
  for (let i = 0; i < 81; i++) if (g[i]) {
    const m = 1 << g[i]
    rows[Math.floor(i / 9)] |= m; cols[i % 9] |= m; boxes[Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)] |= m
  }
  let count = 0
  const solve = (): void => {
    if (count >= limit) return
    let best = -1, bestMask = 0, bestN = 10
    for (let i = 0; i < 81; i++) {
      if (g[i]) continue
      const used = rows[Math.floor(i / 9)] | cols[i % 9] | boxes[Math.floor(i / 27) * 3 + Math.floor((i % 9) / 3)]
      const free = ~used & 0x3fe
      let n = 0
      for (let x = free; x; x &= x - 1) n++
      if (n < bestN) { best = i; bestMask = free; bestN = n; if (n <= 1) break }
    }
    if (best === -1) { count++; return }
    if (bestN === 0) return
    for (let d = 1; d <= 9; d++) {
      const m = 1 << d
      if (!(bestMask & m)) continue
      const rr = Math.floor(best / 9), cc = best % 9, bb = Math.floor(best / 27) * 3 + Math.floor(cc / 3)
      g[best] = d; rows[rr] |= m; cols[cc] |= m; boxes[bb] |= m
      solve()
      g[best] = 0; rows[rr] &= ~m; cols[cc] &= ~m; boxes[bb] &= ~m
      if (count >= limit) return
    }
  }
  solve()
  return count
}

/**
 * Retire des cases une à une tant que la grille reste résoluble par la
 * logique avec les techniques autorisées (jusqu'à `minClues` indices).
 * Une grille terminée par déduction a forcément une solution unique.
 */
export function dig(solution: number[], r: () => number, maxTechnique: Technique, minClues: number): number[] {
  const puzzle = [...solution]
  let clues = 81
  for (const i of shuffle(Array.from({ length: 81 }, (_, k) => k), r)) {
    if (clues <= minClues) break
    const keep = puzzle[i]
    puzzle[i] = 0
    if (logicSolve(puzzle, maxTechnique).solved) clues--
    else puzzle[i] = keep
  }
  return puzzle
}

/** Déguisement identique à celui du jeu (chiffres, lignes/colonnes, transposition) : sert à mesurer la stabilité de la note. */
export function disguise(puzzle: number[], r: () => number): number[] {
  const perm3 = () => shuffle([0, 1, 2], r)
  const order = () => perm3().flatMap((band) => perm3().map((k) => band * 3 + k))
  const digit = [0, ...shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], r)]
  const rows = order(), cols = order(), transpose = r() < 0.5
  const out = new Array(81).fill(0)
  for (let a = 0; a < 9; a++) for (let b = 0; b < 9; b++) out[transpose ? b * 9 + a : a * 9 + b] = digit[puzzle[rows[a] * 9 + cols[b]]]
  return out
}
