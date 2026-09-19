import { neon } from "@neondatabase/serverless"

/**
 * Retourne un client Neon si la base est connectée (variable d'environnement
 * DATABASE_URL présente), sinon `null`. Toute la logique de statistiques
 * doit gérer le cas `null` proprement (pas d'erreur affichée à l'utilisateur).
 */
export function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) return null
  return neon(url)
}

/** Crée la table d'événements si elle n'existe pas encore. */
export async function ensureEventsTable(sql: NonNullable<ReturnType<typeof getDb>>) {
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      difficulty TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
}
