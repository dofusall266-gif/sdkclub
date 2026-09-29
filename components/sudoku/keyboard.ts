/** Chiffre 1-9 correspondant à un événement clavier, ou null.
 * On regarde d'abord `e.key`, puis `e.code` : sur un clavier AZERTY la rangée
 * du haut donne « & é " ' ( » sans Maj (la touche « 1 » est `Digit1`), alors
 * qu'avec Maj elle donne bien « 1 ». Ainsi les chiffres marchent avec ou sans
 * Maj, sur AZERTY comme sur QWERTY. */
export function digitFromKeyEvent(e: KeyboardEvent): number | null {
  if (e.key >= "1" && e.key <= "9" && e.key.length === 1) return Number(e.key)
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code)
  return m ? Number(m[1]) : null
}
