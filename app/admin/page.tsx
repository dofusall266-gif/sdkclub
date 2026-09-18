import type { Metadata } from "next"
import { cookies } from "next/headers"

import { ensureEventsTable, getDb } from "@/lib/db"

export const metadata: Metadata = {
  title: "Statistiques",
  robots: { index: false, follow: false },
}

const COOKIE_NAME = "sc_admin_auth"

async function login(formData: FormData) {
  "use server"
  const password = String(formData.get("password") ?? "")
  const expected = process.env.ADMIN_PASSWORD
  if (expected && password === expected) {
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, expected, {
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

type Row = Record<string, string | number>

export default async function AdminPage() {
  const cookieStore = await cookies()
  const expected = process.env.ADMIN_PASSWORD
  const authed = Boolean(expected) && cookieStore.get(COOKIE_NAME)?.value === expected

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
  let totals: Row | null = null
  let byDifficulty: Row[] = []
  let last30Days: Row[] = []
  let dbError = false

  if (sql) {
    try {
      await ensureEventsTable(sql)
      // Totaux depuis le tout début (aucune limite de temps).
      const totalsRows = await sql`
        SELECT
          count(*) FILTER (WHERE type = 'game_started') AS games_started,
          count(*) FILTER (WHERE type = 'game_won') AS games_won
        FROM events
      `
      totals = totalsRows[0] as Row

      byDifficulty = (await sql`
        SELECT difficulty, count(*) AS count
        FROM events
        WHERE type = 'game_started' AND difficulty IS NOT NULL
        GROUP BY difficulty
        ORDER BY count DESC
      `) as Row[]

      // Tendance récente (30 jours) — les totaux ci-dessus, eux, couvrent tout l'historique.
      last30Days = (await sql`
        SELECT
          to_char(date_trunc('day', created_at), 'DD/MM') AS day,
          count(*) FILTER (WHERE type = 'game_started') AS started,
          count(*) FILTER (WHERE type = 'game_won') AS won
        FROM events
        WHERE created_at > now() - interval '30 days'
        GROUP BY date_trunc('day', created_at)
        ORDER BY date_trunc('day', created_at)
      `) as Row[]
    } catch {
      dbError = true
    }
  }

  const gamesStarted = Number(totals?.games_started ?? 0)
  const gamesWon = Number(totals?.games_won ?? 0)
  const completionRate = gamesStarted > 0 ? Math.round((gamesWon / gamesStarted) * 100) : 0

  return (
    <Shell wide>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Statistiques du site</h1>
        <form action={logout}>
          <button type="submit" className="text-xs text-muted-foreground hover:text-foreground">
            Se déconnecter
          </button>
        </form>
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

      {sql && !dbError && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard label="Parties lancées (total)" value={gamesStarted} />
            <StatCard label="Parties terminées (total)" value={gamesWon} />
            <StatCard label="Taux de complétion" value={`${completionRate}%`} />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold">Parties par niveau de difficulté</h2>
              <div className="mt-3 space-y-2">
                {byDifficulty.length === 0 && (
                  <p className="text-sm text-muted-foreground">Pas encore de données.</p>
                )}
                {byDifficulty.map((row) => (
                  <div key={String(row.difficulty)} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{row.difficulty}</span>
                    <span className="font-semibold">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Tendance — 30 derniers jours</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Les totaux ci-dessus couvrent tout l&apos;historique ; cette liste ne montre que le mois écoulé.
              </p>
              <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
                {last30Days.length === 0 && <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
                {last30Days.map((row) => (
                  <div key={String(row.day)} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.day}</span>
                    <span>
                      {row.started} lancées · {row.won} gagnées
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </Shell>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function Shell({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto w-full px-4 py-10 ${wide ? "max-w-3xl" : "max-w-sm"}`}>{children}</div>
  )
}
