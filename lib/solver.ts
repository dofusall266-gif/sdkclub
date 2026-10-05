/**
 * Solveur LOGIQUE de sudoku — il résout une grille comme le ferait un humain,
 * avec des techniques de déduction, et ne devine JAMAIS.
 *
 * Il sert à fabriquer la banque de grilles (scripts/generate-bank.ts) :
 *  - une grille que ce solveur ne sait pas terminer est rejetée (elle obligerait
 *    à deviner) ;
 *  - les techniques utilisées donnent la note de difficulté de la grille.
 *
 * Il n'est PAS chargé dans le navigateur : le jeu pioche dans la banque déjà
 * calculée (lib/puzzle-bank.ts).
 */

export const TECHNIQUES = [
  "naked_single",
  "hidden_single",
  "pointing",
  "claiming",
  "naked_pair",
  "hidden_pair",
  "naked_triple",
  "hidden_triple",
  "x_wing",
  "xy_wing",
  "turbot",
  "xyz_wing",
  "swordfish",
  "xy_chain",
  "jellyfish",
] as const

export type Technique = (typeof TECHNIQUES)[number]

/** Points par utilisation d'une technique (les chiffres uniques pèsent très peu). */
export const TECHNIQUE_WEIGHT: Record<Technique, number> = {
  naked_single: 1,
  hidden_single: 2,
  pointing: 8,
  claiming: 9,
  naked_pair: 12,
  hidden_pair: 16,
  naked_triple: 22,
  hidden_triple: 30,
  x_wing: 35,
  xy_wing: 40,
  turbot: 45,
  xyz_wing: 55,
  swordfish: 50,
  xy_chain: 70,
  jellyfish: 90,
}

// ---------------------------------------------------------------------------
// Structures de base : unités (27), voisins, masques de chiffres (bit d-1)
// ---------------------------------------------------------------------------

const BIT = [0, 1, 2, 4, 8, 16, 32, 64, 128, 256]
const POP = new Uint8Array(512)
for (let m = 1; m < 512; m++) POP[m] = POP[m >> 1] + (m & 1)

/** 0-8 : lignes, 9-17 : colonnes, 18-26 : blocs. */
const UNITS: number[][] = []
for (let r = 0; r < 9; r++) UNITS.push(Array.from({ length: 9 }, (_, c) => r * 9 + c))
for (let c = 0; c < 9; c++) UNITS.push(Array.from({ length: 9 }, (_, r) => r * 9 + c))
for (let b = 0; b < 9; b++) {
  const br = Math.floor(b / 3) * 3
  const bc = (b % 3) * 3
  const cells: number[] = []
  for (let dr = 0; dr < 3; dr++) for (let dc = 0; dc < 3; dc++) cells.push((br + dr) * 9 + bc + dc)
  UNITS.push(cells)
}

const SEES: boolean[][] = Array.from({ length: 81 }, () => new Array(81).fill(false))
const PEERS: number[][] = Array.from({ length: 81 }, () => [])
for (const unit of UNITS) {
  for (const a of unit) for (const b of unit) if (a !== b) SEES[a][b] = true
}
for (let a = 0; a < 81; a++) for (let b = 0; b < 81; b++) if (SEES[a][b]) PEERS[a].push(b)

const row = (i: number) => Math.floor(i / 9)
const col = (i: number) => i % 9
const box = (i: number) => Math.floor(row(i) / 3) * 3 + Math.floor(col(i) / 3)

interface Board {
  val: number[] // 0 = case vide
  cand: number[] // masque des candidats
}

function place(s: Board, i: number, d: number): void {
  s.val[i] = d
  s.cand[i] = BIT[d]
  const nb = ~BIT[d]
  for (const p of PEERS[i]) if (s.val[p] === 0) s.cand[p] &= nb
}

function elim(s: Board, i: number, d: number): boolean {
  if (s.val[i] === 0 && s.cand[i] & BIT[d]) {
    s.cand[i] &= ~BIT[d]
    return true
  }
  return false
}

function digitsOf(mask: number): number[] {
  const out: number[] = []
  for (let d = 1; d <= 9; d++) if (mask & BIT[d]) out.push(d)
  return out
}

function combos<T>(items: T[], k: number): T[][] {
  const out: T[][] = []
  const rec = (start: number, cur: T[]) => {
    if (cur.length === k) {
      out.push([...cur])
      return
    }
    for (let i = start; i < items.length; i++) {
      cur.push(items[i])
      rec(i + 1, cur)
      cur.pop()
    }
  }
  rec(0, [])
  return out
}

// ---------------------------------------------------------------------------
// Techniques : chacune applique ses déductions et retourne true si elle a
// fait progresser la grille.
// ---------------------------------------------------------------------------

function nakedSingle(s: Board): boolean {
  for (let i = 0; i < 81; i++) {
    if (s.val[i] === 0 && POP[s.cand[i]] === 1) {
      place(s, i, digitsOf(s.cand[i])[0])
      return true
    }
  }
  return false
}

function hiddenSingle(s: Board): boolean {
  for (const unit of UNITS) {
    for (let d = 1; d <= 9; d++) {
      let only = -1
      let n = 0
      for (const i of unit) {
        if (s.val[i] === 0 && s.cand[i] & BIT[d]) {
          only = i
          n++
        }
      }
      if (n === 1) {
        place(s, only, d)
        return true
      }
    }
  }
  return false
}

/** Pointing : dans un bloc, un chiffre confiné à une ligne/colonne => on l'ôte du reste de la ligne/colonne. */
function pointing(s: Board): boolean {
  let progress = false
  for (let b = 18; b < 27; b++) {
    for (let d = 1; d <= 9; d++) {
      const cells = UNITS[b].filter((i) => s.val[i] === 0 && s.cand[i] & BIT[d])
      if (cells.length < 2) continue
      const sameRow = cells.every((i) => row(i) === row(cells[0]))
      const sameCol = cells.every((i) => col(i) === col(cells[0]))
      if (sameRow) {
        for (const i of UNITS[row(cells[0])]) if (box(i) !== b - 18 && elim(s, i, d)) progress = true
      } else if (sameCol) {
        for (const i of UNITS[9 + col(cells[0])]) if (box(i) !== b - 18 && elim(s, i, d)) progress = true
      }
      if (progress) return true
    }
  }
  return progress
}

/** Claiming : dans une ligne/colonne, un chiffre confiné à un bloc => on l'ôte du reste du bloc. */
function claiming(s: Board): boolean {
  for (let u = 0; u < 18; u++) {
    for (let d = 1; d <= 9; d++) {
      const cells = UNITS[u].filter((i) => s.val[i] === 0 && s.cand[i] & BIT[d])
      if (cells.length < 2) continue
      const b = box(cells[0])
      if (!cells.every((i) => box(i) === b)) continue
      let progress = false
      for (const i of UNITS[18 + b]) if (!UNITS[u].includes(i) && elim(s, i, d)) progress = true
      if (progress) return true
    }
  }
  return false
}

function nakedSubset(s: Board, k: number): boolean {
  for (const unit of UNITS) {
    const cells = unit.filter((i) => s.val[i] === 0 && POP[s.cand[i]] >= 2 && POP[s.cand[i]] <= k)
    if (cells.length < k) continue
    for (const group of combos(cells, k)) {
      let union = 0
      for (const i of group) union |= s.cand[i]
      if (POP[union] !== k) continue
      let progress = false
      for (const i of unit) {
        if (s.val[i] === 0 && !group.includes(i) && s.cand[i] & union) {
          s.cand[i] &= ~union
          progress = true
        }
      }
      if (progress) return true
    }
  }
  return false
}

function hiddenSubset(s: Board, k: number): boolean {
  for (const unit of UNITS) {
    // Pour chaque chiffre : masque des positions (dans l'unité) où il peut aller.
    const pos: number[] = new Array(10).fill(0)
    for (let idx = 0; idx < 9; idx++) {
      const i = unit[idx]
      if (s.val[i] !== 0) continue
      for (let d = 1; d <= 9; d++) if (s.cand[i] & BIT[d]) pos[d] |= 1 << idx
    }
    const digits = []
    for (let d = 1; d <= 9; d++) if (POP[pos[d]] >= 2 && POP[pos[d]] <= k) digits.push(d)
    if (digits.length < k) continue
    for (const group of combos(digits, k)) {
      let union = 0
      let keep = 0
      for (const d of group) {
        union |= pos[d]
        keep |= BIT[d]
      }
      if (POP[union] !== k) continue
      let progress = false
      for (let idx = 0; idx < 9; idx++) {
        if (union & (1 << idx)) {
          const i = unit[idx]
          if (s.cand[i] & ~keep) {
            s.cand[i] &= keep
            progress = true
          }
        }
      }
      if (progress) return true
    }
  }
  return false
}

/** Poissons : X-Wing (2), Swordfish (3), Jellyfish (4). */
function fish(s: Board, k: number): boolean {
  for (let d = 1; d <= 9; d++) {
    for (const byRows of [true, false]) {
      // lignes de base = unités 0-8 (si byRows) ou 9-17 ; couvertures = l'autre orientation
      const baseOffset = byRows ? 0 : 9
      const coverOffset = byRows ? 9 : 0
      const lines: { idx: number; cover: number }[] = []
      for (let l = 0; l < 9; l++) {
        let cover = 0
        for (const i of UNITS[baseOffset + l]) {
          if (s.val[i] === 0 && s.cand[i] & BIT[d]) cover |= 1 << (byRows ? col(i) : row(i))
        }
        if (POP[cover] >= 2 && POP[cover] <= k) lines.push({ idx: l, cover })
      }
      if (lines.length < k) continue
      for (const group of combos(lines, k)) {
        let union = 0
        for (const g of group) union |= g.cover
        if (POP[union] !== k) continue
        const baseSet = new Set(group.map((g) => g.idx))
        let progress = false
        for (let c = 0; c < 9; c++) {
          if (!(union & (1 << c))) continue
          for (const i of UNITS[coverOffset + c]) {
            const l = byRows ? row(i) : col(i)
            if (!baseSet.has(l) && elim(s, i, d)) progress = true
          }
        }
        if (progress) return true
      }
    }
  }
  return false
}

function xyWing(s: Board): boolean {
  const bi: number[] = []
  for (let i = 0; i < 81; i++) if (s.val[i] === 0 && POP[s.cand[i]] === 2) bi.push(i)
  for (const p of bi) {
    const [a, b] = digitsOf(s.cand[p])
    for (const w1 of bi) {
      if (!SEES[p][w1] || !(s.cand[w1] & BIT[a]) || s.cand[w1] & BIT[b]) continue
      const c = digitsOf(s.cand[w1] & ~BIT[a])[0]
      for (const w2 of bi) {
        if (w2 === w1 || !SEES[p][w2]) continue
        if (s.cand[w2] !== (BIT[b] | BIT[c])) continue
        let progress = false
        for (let i = 0; i < 81; i++) {
          if (i !== p && i !== w1 && i !== w2 && SEES[i][w1] && SEES[i][w2] && elim(s, i, c)) progress = true
        }
        if (progress) return true
      }
    }
  }
  return false
}

function xyzWing(s: Board): boolean {
  for (let p = 0; p < 81; p++) {
    if (s.val[p] !== 0 || POP[s.cand[p]] !== 3) continue
    const mask = s.cand[p]
    const wings: number[] = []
    for (const q of PEERS[p]) {
      if (s.val[q] === 0 && POP[s.cand[q]] === 2 && (s.cand[q] & ~mask) === 0) wings.push(q)
    }
    for (let x = 0; x < wings.length; x++) {
      for (let y = x + 1; y < wings.length; y++) {
        const w1 = wings[x]
        const w2 = wings[y]
        if (s.cand[w1] === s.cand[w2]) continue
        if ((s.cand[w1] | s.cand[w2]) !== mask) continue
        const common = s.cand[w1] & s.cand[w2]
        if (POP[common] !== 1) continue
        const z = digitsOf(common)[0]
        let progress = false
        for (const i of PEERS[p]) {
          if (i !== w1 && i !== w2 && SEES[i][w1] && SEES[i][w2] && elim(s, i, z)) progress = true
        }
        if (progress) return true
      }
    }
  }
  return false
}

/** Chaîne X à deux liens forts : couvre Skyscraper, cerf-volant (2-string kite) et turbot. */
function turbot(s: Board): boolean {
  for (let d = 1; d <= 9; d++) {
    const links: [number, number][] = []
    for (const unit of UNITS) {
      const cells = unit.filter((i) => s.val[i] === 0 && s.cand[i] & BIT[d])
      if (cells.length === 2) links.push([cells[0], cells[1]])
    }
    for (const [l1a, l1b] of links) {
      for (const [l2a, l2b] of links) {
        for (const [A, B] of [
          [l1a, l1b],
          [l1b, l1a],
        ]) {
          for (const [C, D] of [
            [l2a, l2b],
            [l2b, l2a],
          ]) {
            if (new Set([A, B, C, D]).size !== 4 || !SEES[B][C]) continue
            let progress = false
            for (let i = 0; i < 81; i++) {
              if (i !== A && i !== D && SEES[i][A] && SEES[i][D] && elim(s, i, d)) progress = true
            }
            if (progress) return true
          }
        }
      }
    }
  }
  return false
}

/** Chaîne XY : suite de cases à 2 candidats, chacune liée à la précédente par un chiffre commun. */
function xyChain(s: Board): boolean {
  const bi: number[] = []
  for (let i = 0; i < 81; i++) if (s.val[i] === 0 && POP[s.cand[i]] === 2) bi.push(i)
  const MAX_LEN = 8

  for (const start of bi) {
    for (const x of digitsOf(s.cand[start])) {
      const startOut = digitsOf(s.cand[start] & ~BIT[x])[0]
      const path = [start]
      let found = false
      const dfs = (cur: number, link: number): void => {
        if (found) return
        for (const nxt of bi) {
          if (found) return
          if (path.includes(nxt) || !SEES[cur][nxt] || !(s.cand[nxt] & BIT[link])) continue
          const out = digitsOf(s.cand[nxt] & ~BIT[link])[0]
          path.push(nxt)
          if (out === x && path.length >= 3) {
            let progress = false
            for (let i = 0; i < 81; i++) {
              if (!path.includes(i) && SEES[i][start] && SEES[i][nxt] && elim(s, i, x)) progress = true
            }
            if (progress) {
              found = true
              return
            }
          }
          if (path.length < MAX_LEN) dfs(nxt, out)
          path.pop()
        }
      }
      dfs(start, startOut)
      if (found) return true
    }
  }
  return false
}

const RUNNERS: Record<Technique, (s: Board) => boolean> = {
  naked_single: nakedSingle,
  hidden_single: hiddenSingle,
  pointing,
  claiming,
  naked_pair: (s) => nakedSubset(s, 2),
  hidden_pair: (s) => hiddenSubset(s, 2),
  naked_triple: (s) => nakedSubset(s, 3),
  hidden_triple: (s) => hiddenSubset(s, 3),
  x_wing: (s) => fish(s, 2),
  xy_wing: xyWing,
  turbot,
  xyz_wing: xyzWing,
  swordfish: (s) => fish(s, 3),
  xy_chain: xyChain,
  jellyfish: (s) => fish(s, 4),
}

// ---------------------------------------------------------------------------
// Résolution complète
// ---------------------------------------------------------------------------

export interface LogicResult {
  solved: boolean
  /** Chiffres uniques : nombre de cases posées. Autres techniques : nombre de « tours » où elles ont servi. */
  uses: Record<Technique, number>
  /** Technique la plus difficile utilisée (null si aucune). */
  hardest: Technique | null
  /** Somme brute des points (voir TECHNIQUE_WEIGHT). */
  score: number
  /** Grille résolue (si `solved`). */
  solution: number[] | null
}

/**
 * Résout `puzzle` (81 chiffres, 0 = vide) par déduction uniquement.
 * `maxTechnique` limite la boîte à outils (pour fabriquer les niveaux faciles).
 * `checkAgainst` (tests) : vérifie qu'aucune déduction ne retire le bon chiffre.
 * `skip` (tests) : techniques à ignorer, pour faire travailler les plus rares.
 */
export function logicSolve(
  puzzle: number[],
  maxTechnique: Technique = "jellyfish",
  checkAgainst?: number[],
  skip?: ReadonlySet<Technique>,
): LogicResult {
  const s: Board = { val: new Array(81).fill(0), cand: new Array(81).fill(511) }
  for (let i = 0; i < 81; i++) if (puzzle[i]) place(s, i, puzzle[i])

  const uses = Object.fromEntries(TECHNIQUES.map((t) => [t, 0])) as Record<Technique, number>
  const limit = TECHNIQUES.indexOf(maxTechnique)
  let hardestIdx = -1
  let score = 0

  const verify = (t: Technique) => {
    if (!checkAgainst) return
    for (let i = 0; i < 81; i++) {
      if (!(s.cand[i] & BIT[checkAgainst[i]])) throw new Error(`Technique "${t}" a retiré le bon chiffre en case ${i}`)
    }
  }

  for (let guard = 0; guard < 400; guard++) {
    let progressed = false
    for (let t = 0; t <= limit; t++) {
      const name = TECHNIQUES[t]
      if (skip?.has(name)) continue
      if (RUNNERS[name](s)) {
        // Techniques avancées : on les applique jusqu'à épuisement (« fermeture ») et on
        // compte UN tour. Le nombre de tours ne dépend pas de l'ordre de balayage de la
        // grille, contrairement au nombre de déductions prises une par une.
        if (t >= 2) for (let k = 0; k < 200 && RUNNERS[name](s); k++);
        uses[name]++
        score += TECHNIQUE_WEIGHT[name]
        if (t > hardestIdx) hardestIdx = t
        verify(name)
        progressed = true
        break
      }
    }
    if (!progressed) break
    if (s.val.every((v) => v !== 0)) break
  }

  const solved = s.val.every((v) => v !== 0)
  return {
    solved,
    uses,
    hardest: hardestIdx >= 0 ? TECHNIQUES[hardestIdx] : null,
    score,
    solution: solved ? [...s.val] : null,
  }
}

// ---------------------------------------------------------------------------
// Note de difficulté
// ---------------------------------------------------------------------------

/**
 * Difficulté « brute » d'une résolution : ce sont surtout les techniques
 * avancées qui comptent (la plus difficile utilisée pèse triple), les chiffres
 * uniques très peu — sinon une grille simple mais longue paraîtrait dure.
 */
export function rawDifficulty(r: LogicResult): number {
  // Chaque case vide finit par être posée par un chiffre unique : on compte donc
  // les chiffres uniques d'un bloc, sans distinguer « nu » et « caché » (cette
  // distinction dépend de l'ordre de balayage, pas de la grille elle-même).
  const singles = r.uses.naked_single + r.uses.hidden_single
  let advanced = 0
  for (const t of TECHNIQUES.slice(2)) advanced += r.uses[t] * TECHNIQUE_WEIGHT[t]
  const hardest = r.hardest ? TECHNIQUE_WEIGHT[r.hardest] : 0
  return 0.45 * singles + advanced + 3 * hardest
}

/**
 * Note de 1 à 100. Courbe par paliers, réglée sur des milliers de grilles
 * réellement générées pour que chaque niveau occupe une tranche bien remplie :
 * (difficulté brute -> note). Au-delà des extrémités, la note est bornée.
 */
const RATING_ANCHORS: [number, number][] = [
  [21, 3],
  [33, 18],
  [53, 26],
  [130, 42],
  [215, 60],
  [330, 76],
  [450, 90],
  [600, 100],
]

export function ratingFromRaw(raw: number): number {
  const first = RATING_ANCHORS[0]
  const last = RATING_ANCHORS[RATING_ANCHORS.length - 1]
  if (raw <= first[0]) return first[1]
  if (raw >= last[0]) return last[1]
  for (let i = 1; i < RATING_ANCHORS.length; i++) {
    const [x1, y1] = RATING_ANCHORS[i]
    if (raw <= x1) {
      const [x0, y0] = RATING_ANCHORS[i - 1]
      return Math.round(y0 + ((raw - x0) / (x1 - x0)) * (y1 - y0))
    }
  }
  return last[1]
}

/** Tranche de notes de chaque niveau (bornes comprises). */
export const LEVEL_RANGES = {
  facile: [1, 22],
  moyen: [23, 42],
  difficile: [43, 60],
  expert: [61, 76],
  diabolique: [77, 90],
  fou: [91, 100],
} as const
