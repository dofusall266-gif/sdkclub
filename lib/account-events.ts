/** Événements internes pour ouvrir la fenêtre de connexion depuis n'importe où et rafraîchir l'interface après une connexion. */
export const OPEN_ACCOUNT_EVENT = "sc:open-account"
export const PROFILE_EVENT = "sc:profile-changed"

export function openAccountDialog(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_ACCOUNT_EVENT))
}

export function notifyProfileChanged(): void {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(PROFILE_EVENT))
}
