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


/** Deux cases distinctes se « voient » si elles sont dans la même ligne, la même colonne ou le même bloc. */
export function seesCell(a: number, b: number): boolean {
  if (a === b) return false
  const sameRow = Math.floor(a / 9) === Math.floor(b / 9)
  const sameCol = a % 9 === b % 9
  const sameBox = Math.floor(a / 27) === Math.floor(b / 27) && Math.floor((a % 9) / 3) === Math.floor((b % 9) / 3)
  return sameRow || sameCol || sameBox
}

/** La « zone » d'une case : toutes les cases qu'elle voit (sa ligne, sa colonne et son bloc), sans elle-même. */
export function zoneOf(cell: number): Set<number> {
  const zone = new Set<number>()
  for (let j = 0; j < 81; j++) if (seesCell(cell, j)) zone.add(j)
  return zone
}

/** Pourquoi deux cases se voient : « même ligne », « même colonne » ou « même bloc ». */
function relation(a: number, b: number, locale: "fr" | "en"): string {
  const fr = locale === "fr"
  if (Math.floor(a / 9) === Math.floor(b / 9)) return fr ? "même ligne" : "same row"
  if (a % 9 === b % 9) return fr ? "même colonne" : "same column"
  return fr ? "même bloc" : "same box"
}

/** Y-Wing : explication pas à pas, avec la raison pour laquelle chaque case en « voit » une autre. */
function explainYWing(pattern: TrainingPattern, dc: DecodedCase, locale: "fr" | "en"): string {
  const fr = locale === "fr"
  const pv = pattern.pv!
  const wings = pattern.c.filter((i) => i !== pv)
  const [a, b] = dc.candidates[pv]
  const d = pattern.d
  // Aile « A d » (contient le premier chiffre du pivot) et aile « B d » (contient le second).
  const wingA = dc.candidates[wings[0]].includes(a) ? wings[0] : wings[1]
  const wingB = wingA === wings[0] ? wings[1] : wings[0]
  const pair = (i: number, x: number, y: number) => `${rc(i, locale)} (${x} ${y})`

  const elimLines = pattern.e
    .map((e) =>
      fr
        ? `• ${rc(e, locale)} voit ${rc(wingA, locale)} (${relation(e, wingA, locale)}) et ${rc(wingB, locale)} (${relation(e, wingB, locale)})`
        : `• ${rc(e, locale)} sees ${rc(wingA, locale)} (${relation(e, wingA, locale)}) and ${rc(wingB, locale)} (${relation(e, wingB, locale)})`,
    )
    .join("\n")

  return fr
    ? `Le pivot ${rc(pv, locale)} contient ${a} et ${b}. Il « voit » toutes les cases de sa ligne, de sa colonne et de son bloc : c'est sa zone (en bleu).\n\nSes deux ailes sont dans cette zone :\n• ${pair(wingA, a, d)} : ${relation(wingA, pv, locale)} que le pivot\n• ${pair(wingB, b, d)} : ${relation(wingB, pv, locale)} que le pivot\n\nSi le pivot vaut ${a}, l'aile ${rc(wingA, locale)} ne peut plus valoir ${a} : elle vaut ${d}. S'il vaut ${b}, c'est l'aile ${rc(wingB, locale)} qui vaut ${d}. Dans les deux cas, une des deux ailes vaut ${d}.\n\nToute case qui voit les deux ailes ne peut donc pas contenir ${d}. On retire le ${d} (barré en rouge) de :\n${elimLines}`
    : `The pivot ${rc(pv, locale)} holds ${a} and ${b}. It “sees” every cell in its row, its column and its box: that is its zone (in blue).\n\nIts two wings are inside that zone:\n• ${pair(wingA, a, d)}: ${relation(wingA, pv, locale)} as the pivot\n• ${pair(wingB, b, d)}: ${relation(wingB, pv, locale)} as the pivot\n\nIf the pivot is ${a}, wing ${rc(wingA, locale)} cannot be ${a}: it is ${d}. If it is ${b}, wing ${rc(wingB, locale)} is ${d}. Either way, one of the two wings is ${d}.\n\nAny cell that sees both wings therefore cannot hold ${d}. We remove the ${d} (crossed out in red) from:\n${elimLines}`
}

/** Explication en langage clair d'un motif trouvé. */
export function explainPattern(tech: TrainingTech, pattern: TrainingPattern, dc: DecodedCase, locale: "fr" | "en"): string {
  const fr = locale === "fr"
  const elim = list(pattern.e, locale)
  if (tech === "xy_wing" && pattern.pv !== undefined) {
    return explainYWing(pattern, dc, locale)
  }
  return explainFish(tech, pattern, locale)
}

/** X-Wing / Swordfish : explication pas à pas, avec les lignes de base, les colonnes de couverture et les éliminations. */
function explainFish(tech: TrainingTech, pattern: TrainingPattern, locale: "fr" | "en"): string {
  const fr = locale === "fr"
  const lines = pattern.l!
  const isRows = lines.k === "r"
  // Repères comme sur la grille : L2, L5 et L8 / C1, C4 et C8 (R pour « row » en anglais).
  const rowTag = fr ? "L" : "R"
  const tags = (xs: number[], prefix: string) => {
    const a = xs.map((x) => `${prefix}${x + 1}`)
    return a.length <= 1 ? a[0] : `${a.slice(0, -1).join(", ")} ${fr ? "et" : "and"} ${a[a.length - 1]}`
  }
  const base = tags(lines.b, isRows ? rowTag : "C")
  const cover = tags(lines.v, isRows ? "C" : rowTag)
  const n = lines.b.length
  const name = tech === "x_wing" ? "X-Wing" : "Swordfish"
  const d = pattern.d
  const elim = list(pattern.e, locale)
  if (fr) {
    const baseWord = isRows ? "lignes" : "colonnes"
    const coverWord = isRows ? "colonnes" : "lignes"
    const coverOne = isRows ? "colonne" : "ligne"
    const places = n === 2 ? "que 2 places possibles" : "que 2 ou 3 places possibles"
    return `Ici, c'est un ${name} sur le chiffre ${d}. Dans les ${baseWord} ${base} (en bleu), le ${d} n'a ${places}, et toutes ces places (cases vertes) tiennent dans les ${n} mêmes ${coverWord} : ${cover} (en orange).\n\nChacune de ces ${n} ${baseWord} doit contenir un ${d}, et il ne peut être que sur une case verte. Les ${n} chiffres ${d} occupent donc forcément ces ${n} ${coverWord}, un par ${coverOne}.\n\nChaque ${coverOne} (${cover}) a ainsi déjà son ${d} dans une de ces ${baseWord} : ailleurs dans ces ${coverWord}, le ${d} est impossible. On le retire (barré en rouge) de : ${elim}.`
  }
  const baseWord = isRows ? "rows" : "columns"
  const coverWord = isRows ? "columns" : "rows"
  const coverOne = isRows ? "column" : "row"
  const places = n === 2 ? "only 2 possible spots" : "only 2 or 3 possible spots"
  return `Here we have a ${name} on the digit ${d}. In ${baseWord} ${base} (blue), the ${d} has ${places}, and all those spots (green cells) fit in the same ${n} ${coverWord}: ${cover} (orange).\n\nEach of these ${n} ${baseWord} must contain a ${d}, and it can only be on a green cell. The ${n} digits ${d} therefore occupy these ${n} ${coverWord}, one per ${coverOne}.\n\nEach ${coverOne} (${cover}) thus already has its ${d} in one of these ${baseWord}: elsewhere in these ${coverWord}, the ${d} is impossible. We remove it (crossed out in red) from: ${elim}.`
}
