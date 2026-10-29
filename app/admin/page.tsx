import { createHash } from "node:crypto"

import type { Metadata } from "next"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ResetStatsButton } from "@/components/admin/reset-stats-button"
import { Dash } from "@/components/admin/dashboard"
import { loadDashboard, type Dashboard } from "@/lib/admin-stats"
import { ensureDailyScoresTable, ensureEventsTable, getDb } from "@/lib/db"

export const metadata: Metadata = {
  title: "Statistiques",
  robots: { index: false, follow: false },
}

const COOKIE_NAME = "sc_admin_auth"

/** Empreinte du mot de passe admin : on ne met jamais le mot de passe lui-même
 * dans le cookie, seulement ce hash, pour rien exposer s'il fuit un jour. */
function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex")
}

async function login(formData: FormData) {
  "use server"
  const password = String(formData.get("password") ?? "")
  const expected = process.env.ADMIN_PASSWORD
  if (expected && password === expected) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, hashPassword(expected), {
      httpOnly: true,
      sameSite: "lax",
      path: "/admin",
      maxAge: 60 * 60 * 24 * 30,
    })
  }
}

async function logout() {
  "use server"
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

async function checkAuthed() {
  const cookieStore = await cookies()
  const expected = process.env.ADMIN_PASSWORD
  return Boolean(expected) && cookieStore.get(COOKIE_NAME)?.value === hashPassword(expected)
}

/** Vide la table des événements (parties jouées). Ne touche pas au classement du défi du jour. */
async function resetEvents() {
  "use server"
  if (!(await checkAuthed())) return
  const sql = getDb()
  if (!sql) return
  await ensureEventsTable(sql)
  await sql`DELETE FROM events`
  revalidatePath("/admin")
}

/** Vide le classement du défi du jour (tous les jours, pas seulement aujourd'hui). */
async function resetDaily() {
  "use server"
  if (!(await checkAuthed())) return
  const sql = getDb()
  if (!sql) return
  await ensureDailyScoresTable(sql)
  await sql`DELETE FROM daily_scores`
  revalidatePath("/admin")
}

const PERIODS = [7, 30, 90]

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ jours?: string }> }) {
  const { jours } = await searchParams
  const days = PERIODS.includes(Number(jours)) ? Number(jours) : 30
  const authed = await checkAuthed()
  const expected = process.env.ADMIN_PASSWORD

  if (!expected) {
    return (
      <Shell>
        <h1 className="text-xl font-bold">Statistiques non configurées</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ajoutez une variable d&apos;environnement <code className="rounded bg-muted px-1 py-0.5">ADMIN_PASSWORD</code>{" "}
          (le mot de passe de votre choix pour accéder à cette page) dans les réglages de votre projet.
        </p>
      </Shell>
    )
  }

  if (!authed) {
    return (
      <Shell>
        <h1 className="text-xl font-bold">Statistiques — accès privé</h1>
        <form action={login} className="mt-5 flex flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="Mot de passe"
            required
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Accéder
          </button>
        </form>
      </Shell>
    )
  }

  const sql = getDb()
  let dash: Dashboard | null = null
  let dbError = false

  if (sql) {
    try {
      await ensureEventsTable(sql)
      await ensureDailyScoresTable(sql)
      dash = await loadDashboard(sql, days)
    } catch {
      dbError = true
    }
  }

  return (
    <Shell wide>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Tableau de bord</h1>
        <div className="flex items-center gap-4">
          <nav className="flex gap-1 rounded-lg border border-border p-0.5 text-sm" aria-label="Période">
            {PERIODS.map((p) => (
              <a
                key={p}
                href={`/admin?jours=${p}`}
                className={`rounded-md px-3 py-1 ${p === days ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {p} jours
              </a>
            ))}
          </nav>
          <form action={logout}>
            <button type="submit" className="text-xs text-muted-foreground hover:text-foreground">
              Se déconnecter
            </button>
          </form>
        </div>
      </div>

      {!sql && (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          Aucune base de données connectée pour le moment (variable <code>DATABASE_URL</code> manquante). Connectez
          Neon depuis les réglages de votre projet pour activer les statistiques.
        </p>
      )}

      {sql && dbError && (
        <p className="mt-4 rounded-lg border border-dashed border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          Impossible de lire les statistiques pour le moment. Vérifiez que la base Neon est bien connectée.
        </p>
      )}

      {dash && <Dash d={dash} />}

      {sql && !dbError && (
        <div className="mt-12 rounded-xl border border-dashed border-destructive/30 p-4">
          <h2 className="text-sm font-semibold text-destructive">Zone sensible</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Repart de zéro pour recommencer la prise de données (utile après des tests, par exemple).
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <ResetStatsButton
              action={resetEvents}
              label="Réinitialiser les parties jouées"
              confirmText="Supprimer définitivement toutes les statistiques de parties (temps, erreurs, appareils) ? Cette action est irréversible."
            />
            <ResetStatsButton
              action={resetDaily}
              label="Réinitialiser le classement du défi"
              confirmText="Supprimer définitivement tous les scores du défi du jour (tous les jours confondus) ? Cette action est irréversible."
            />
          </div>
        </div>
      )}
    </Shell>
  )
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return <div className={`mx-auto w-full px-4 py-10 ${wide ? "max-w-5xl" : "max-w-sm"}`}>{children}</div>
}
