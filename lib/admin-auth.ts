import { createHash } from "node:crypto"

import { cookies } from "next/headers"

/** Même cookie et même empreinte que la page /admin (le cookie est valable sur tout /admin/*). */
const COOKIE_NAME = "sc_admin_auth"

export async function isAdminAuthed(): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value === createHash("sha256").update(expected).digest("hex")
}
