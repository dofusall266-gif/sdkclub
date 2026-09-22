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

/** Crée la table d'événements si elle n'existe pas encore, et ajoute les colonnes
 * détaillées (durée, erreurs, appareil) si elles n'existent pas déjà — utile pour
 * les sites déjà en production avec l'ancien schéma. */
export async function ensureEventsTable(sql: NonNullable<ReturnType<typeof getDb>>) {
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id BIGSERIAL PRIMARY KEY,
      type TEXT NOT NULL,
      difficulty TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS duration_seconds INTEGER`
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS mistakes INTEGER`
  await sql`ALTER TABLE events ADD COLUMN IF NOT EXISTS device TEXT`
}

/** Table des scores du défi du jour (pseudo + drapeau choisis, pas de compte). */
export async function ensureDailyScoresTable(sql: NonNullable<ReturnType<typeof getDb>>) {
  await sql`
    CREATE TABLE IF NOT EXISTS daily_scores (
      id BIGSERIAL PRIMARY KEY,
      date DATE NOT NULL,
      player_id TEXT NOT NULL,
      pseudo TEXT NOT NULL,
      country_code TEXT,
      seconds INTEGER NOT NULL,
      mistakes INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (date, player_id)
    )
  `
}
