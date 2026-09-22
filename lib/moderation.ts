// Filtre volontairement simple (le pseudo est public dans un classement sans compte).
// Ne couvre pas tout, mais bloque les cas les plus évidents. À enrichir si besoin.
const BLOCKED_SUBSTRINGS = [
  "encul", "salope", "pute", "connard", "batard", "négro", "nègre", "nazi", "hitler",
  "fuck", "nigger", "bitch", "whore", "rape", "admin", "moderator", "sudokuclub",
]

export function sanitizePseudo(input: string): string | null {
  const cleaned = input
    .replace(/[\u0000-\u001f\u007f]/g, "") // caractères de contrôle
    .trim()
    .slice(0, 20)

  if (cleaned.length < 1) return null

  const normalized = cleaned
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

  if (BLOCKED_SUBSTRINGS.some((bad) => normalized.includes(bad))) return null

  return cleaned
}

export function isValidCountryCode(code: unknown): code is string {
  return typeof code === "string" && /^[A-Z]{2}$/.test(code)
}
