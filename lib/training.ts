/** Outils des exercices d'entraînement : décodage des cas, vérification de la réponse du joueur, explications. */

export type TrainingTech = "x_wing" | "xy_wing" | "swordfish"

export interface TrainingPattern {
  /** Chiffre du motif (X-Wing, Swordfish) ou chiffre éliminé (Y-Wing). */
  d: number
  /** Cases du motif. */
  c: number[]
  /** Cases où le chiffre `d` peut être retiré. */
  e: number[]
  /** Y-Wing : case pivot. */
  pv?: number
  /** Poissons : "r" = lignes de base, "c" = colonnes de base ; `b` = lignes/colonnes de base (0-8), `v` = couverture (0-8). */
  l?: { k: "r" | "c"; b: number[]; v: number[] }
}

/** Forme compacte stockée dans lib/training-cases.ts. */
export interface TrainingCase {
  /** 81 chiffres : cases déjà posées (0 = vide). */
  v: string
  /** 81 × 3 caractères hexadécimaux : masque des candidats (bit d-1 = chiffre d). */
  c: string
  p: TrainingPattern[]
}

export interface DecodedCase {
  values: number[]
  /** candidates[i] = chiffres encore possibles dans la case i (vide si case posée). */
  candidates: number[][]
  masks: number[]
  patterns: TrainingPattern[]
}

export function decodeCase(tc: TrainingCase): DecodedCase {
  const values = Array.from(tc.v, Number)
  const masks = Array.from({ length: 81 }, (_, i) => parseInt(tc.c.slice(i * 3, i * 3 + 3), 16))
  const candidates = masks.map((m, i) => {
    if (values[i] !== 0) return []
    const out: number[] = []
    for (let d = 1; d <= 9; d++) if (m & (1 << (d - 1))) out.push(d)
    return out
  })
  return { values, candidates, masks, patterns: tc.p }
}

export const TECH_SIZE_HINT: Record<TrainingTech, number> = { x_wing: 4, xy_wing: 3, swordfish: 9 }

export interface CheckResult {
  /** Index du motif reconnu, ou -1. */
  matched: number
  /** Meilleur recouvrement avec un des motifs (cases justes), pour guider sans tout révéler. */
  bestOverlap: number
  /** Taille du motif le plus proche. */
  bestSize: number
}

/** Compare la sélection du joueur avec les motifs valides de la grille. */
export function checkSelection(selected: Set<number>, patterns: TrainingPattern[]): CheckResult {
  let bestOverlap = 0
  let bestSize = patterns[0]?.c.length ?? 0
  for (let k = 0; k < patterns.length; k++) {
    const cells = patterns[k].c
    const overlap = cells.filter((i) => selected.has(i)).length
    if (overlap === cells.length && selected.size === cells.length) return { matched: k, bestOverlap: overlap, bestSize: cells.length }
    if (overlap > bestOverlap) {
      bestOverlap = overlap
      bestSize = cells.length
    }
  }
  return { matched: -1, bestOverlap, bestSize }
}

const rc = (i: number, locale: "fr" | "en") => `${locale === "fr" ? "L" : "R"}${Math.floor(i / 9) + 1}C${(i % 9) + 1}`
const list = (cells: number[], locale: "fr" | "en") => cells.map((i) => rc(i, locale)).join(", ")
const nums = (xs: number[], locale: "fr" | "en") => {
  const a = xs.map((x) => x + 1)
  return a.length <= 1 ? String(a[0]) : `${a.slice(0, -1).join(", ")} ${locale === "fr" ? "et" : "and"} ${a[a.length - 1]}`
}

/** Explication en langage clair d'un motif trouvé. */
export function explainPattern(tech: TrainingTech, pattern: TrainingPattern, dc: DecodedCase, locale: "fr" | "en"): string {
  const fr = locale === "fr"
  const elim = list(pattern.e, locale)
  if (tech === "xy_wing" && pattern.pv !== undefined) {
    const wings = pattern.c.filter((i) => i !== pattern.pv)
    const digits = (i: number) => dc.candidates[i].join("")
    const pivotDigits = dc.candidates[pattern.pv]
    const [a, b] = pivotDigits
    return fr
      ? `Le pivot ${rc(pattern.pv, locale)} ne peut contenir que ${a} ou ${b}. Ses deux ailes ${rc(wings[0], locale)} (${digits(wings[0])}) et ${rc(wings[1], locale)} (${digits(wings[1])}) voient le pivot. Si le pivot vaut ${a}, l'aile qui contient ${a} ne peut pas le prendre et vaut donc ${pattern.d} ; s'il vaut ${b}, c'est l'autre aile qui vaut ${pattern.d}. Dans les deux cas, une des ailes vaut ${pattern.d} : toute case qui voit les deux ailes ne peut donc pas contenir ${pattern.d}. On le retire de ${elim}.`
      : `The pivot ${rc(pattern.pv, locale)} can only be ${a} or ${b}. Its two wings ${rc(wings[0], locale)} (${digits(wings[0])}) and ${rc(wings[1], locale)} (${digits(wings[1])}) both see the pivot. If the pivot is ${a}, the wing holding ${a} cannot be ${a}, so it is ${pattern.d}; if the pivot is ${b}, the other wing is ${pattern.d}. Either way one of the wings is ${pattern.d}, so any cell that sees both wings cannot be ${pattern.d}. Remove it from ${elim}.`
  }
  const lines = pattern.l!
  const isRows = lines.k === "r"
  const base = nums(lines.b, locale)
  const cover = nums(lines.v, locale)
  const n = lines.b.length
  const name = tech === "x_wing" ? "X-Wing" : "Swordfish"
  if (fr) {
    const baseWord = isRows ? (n === 2 ? "lignes" : "lignes") : "colonnes"
    const coverWord = isRows ? "colonnes" : "lignes"
    return `Le chiffre ${pattern.d} n'a que quelques places possibles dans les ${baseWord} ${base}, et toutes se trouvent dans les mêmes ${n} ${coverWord} (${cover}). Les ${n} ${pattern.d} de ces ${baseWord} se répartiront donc forcément un par ${coverWord === "colonnes" ? "colonne" : "ligne"} : c'est un ${name}. Les ${coverWord} ${cover} ont ainsi déjà leur ${pattern.d} dans le motif, et on peut le retirer de ${elim}.`
  }
  const baseWord = isRows ? "rows" : "columns"
  const coverWord = isRows ? "columns" : "rows"
  return `The digit ${pattern.d} has only a few possible spots in ${baseWord} ${base}, and all of them sit in the same ${n} ${coverWord} (${cover}). The ${n} copies of ${pattern.d} in those ${baseWord} must therefore land one per ${coverWord === "columns" ? "column" : "row"}: this is a ${name}. ${coverWord[0].toUpperCase()}${coverWord.slice(1)} ${cover} already get their ${pattern.d} from the pattern, so ${pattern.d} can be removed from ${elim}.`
}
