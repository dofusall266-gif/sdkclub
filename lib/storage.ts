/** Petits helpers autour de localStorage : ne lèvent jamais d'erreur (mode privé,
 * quota dépassé, SSR...) et renvoient simplement `null` / ne font rien en cas d'échec. */

export function readJSON<T>(key: string): T | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Stockage indisponible (navigation privée, quota...) : on ignore silencieusement.
  }
}

export function remove(key: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore
  }
}
