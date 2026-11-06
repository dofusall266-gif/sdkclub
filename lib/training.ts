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
      ? `Ici on se focalise sur le pivot ${rc(pattern.pv, locale)} : il ne peut contenir que ${a} ou ${b}. Ses deux ailes ${rc(wings[0], locale)} (${digits(wings[0])}) et ${rc(wings[1], locale)} (${digits(wings[1])}) voient le pivot. Si le pivot vaut ${a}, l'aile qui contient ${a} ne peut pas le prendre et vaut donc ${pattern.d} ; s'il vaut ${b}, c'est l'autre aile qui vaut ${pattern.d}. Dans les deux cas, une des ailes vaut ${pattern.d} : toute case qui voit les deux ailes ne peut donc pas contenir ${pattern.d}. On peut donc retirer le ${pattern.d} de ${elim} afin de faciliter la suite de la partie.`
      : `Here we focus on the pivot ${rc(pattern.pv, locale)}: it can only be ${a} or ${b}. Its two wings ${rc(wings[0], locale)} (${digits(wings[0])}) and ${rc(wings[1], locale)} (${digits(wings[1])}) both see the pivot. If the pivot is ${a}, the wing holding ${a} cannot be ${a}, so it is ${pattern.d}; if the pivot is ${b}, the other wing is ${pattern.d}. Either way one of the wings is ${pattern.d}, so any cell that sees both wings cannot be ${pattern.d}. We can therefore remove ${pattern.d} from ${elim} to make the rest of the game easier.`
  }
  const lines = pattern.l!
  const isRows = lines.k === "r"
  const base = nums(lines.b, locale)
  const cover = nums(lines.v, locale)
  const n = lines.b.length
  const name = tech === "x_wing" ? "X-Wing" : "Swordfish"
  const d = pattern.d
  if (fr) {
    const baseWord = isRows ? "lignes" : "colonnes"
    const coverWord = isRows ? "colonnes" : "lignes"
    const coverOne = isRows ? "colonne" : "ligne"
    const shape = n === 2 ? "un rectangle" : `un motif de ${n} ${baseWord} et ${n} ${coverWord}`
    return `Ici on se focalise sur le chiffre ${d} : dans les ${baseWord} ${base}, le ${d} n'a que quelques places possibles, et toutes se trouvent dans les mêmes ${n} ${coverWord} (${cover}) → ce qui forme ${shape}. Les ${n} chiffres ${d} de ces ${baseWord} se répartiront donc forcément un par ${coverOne} : c'est un ${name}. On peut donc éliminer les autres ${d} de ces ${coverWord} (${elim}) afin de faciliter la suite de la partie.`
  }
  const baseWord = isRows ? "rows" : "columns"
  const coverWord = isRows ? "columns" : "rows"
  const coverOne = isRows ? "column" : "row"
  const shape = n === 2 ? "a rectangle" : `a pattern of ${n} ${baseWord} and ${n} ${coverWord}`
  return `Here we focus on the digit ${d}: in ${baseWord} ${base}, the ${d} has only a few possible spots, and all of them sit in the same ${n} ${coverWord} (${cover}) → which forms ${shape}. The ${n} digits ${d} in those ${baseWord} must therefore land one per ${coverOne}: this is a ${name}. We can therefore eliminate the other ${d}s in those ${coverWord} (${elim}) to make the rest of the game easier.`
}
