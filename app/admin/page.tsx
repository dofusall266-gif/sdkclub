import type { Metadata } from "next"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

import { ResetStatsButton } from "@/components/admin/reset-stats-button"
import { ensureDailyScoresTable, ensureEventsTable, getDb } from "@/lib/db"
import { todayKey } from "@/lib/daily"

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

async function checkAuthed() {
  const cookieStore = await cookies()
  const expected = process.env.ADMIN_PASSWORD
  return Boolean(expected) && cookieStore.get(COOKIE_NAME)?.value === expected
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

type Row = Record<string, string | number | null>

export default async function AdminPage() {
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
  let totals: Row | null = null
  let byDifficulty: Row[] = []
  let last30Days: Row[] = []
  let byDevice: Row[] = []
  let dailyStats: Row | null = null
  let dbError = false

  if (sql) {
    try {
      await ensureEventsTable(sql)
      await ensureDailyScoresTable(sql)

      const totalsRows = await sql`
        SELECT
          count(*) FILTER (WHERE type = 'game_started') AS games_started,
          count(*) FILTER (WHERE type = 'game_won') AS games_won,
          round(avg(duration_seconds) FILTER (WHERE type = 'game_won')) AS avg_seconds,
          round(avg(mistakes) FILTER (WHERE type = 'game_won'), 1) AS avg_mistakes
        FROM events
      `
      totals = totalsRows[0] as Row

      byDifficulty = (await sql`
        SELECT
          difficulty,
          count(*) FILTER (WHERE type = 'game_started') AS started,
          count(*) FILTER (WHERE type = 'game_won') AS won,
          round(avg(duration_seconds) FILTER (WHERE type = 'game_won')) AS avg_seconds
        FROM events
        WHERE difficulty IS NOT NULL
        GROUP BY difficulty
        ORDER BY started DESC
      `) as Row[]

      byDevice = (await sql`
        SELECT device, count(*) AS count
        FROM events
        WHERE type = 'game_started' AND device IS NOT NULL
        GROUP BY device
        ORDER BY count DESC
      `) as Row[]

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

      const dailyRows = await sql`
        SELECT count(*) AS participants, round(avg(seconds)) AS avg_seconds, min(seconds) AS best_seconds
        FROM daily_scores
        WHERE date = ${todayKey()}
      `
      dailyStats = dailyRows[0] as Row
    } catch {
      dbError = true
    }
  }

  const gamesStarted = Number(totals?.games_started ?? 0)
  const gamesWon = Number(totals?.games_won ?? 0)
  const completionRate = gamesStarted > 0 ? Math.round((gamesWon / gamesStarted) * 100) : 0
  const abandoned = Math.max(0, gamesStarted - gamesWon)

  return (
    <Shell wide>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Statistiques du site</h1>
        <div className="flex items-center gap-3">
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

      {sql && !dbError && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Parties lancées" value={gamesStarted} />
            <StatCard label="Parties terminées" value={gamesWon} />
            <StatCard label="Taux de complétion" value={`${completionRate}%`} />
            <StatCard label="Parties abandonnées" value={abandoned} />
            <StatCard label="Temps moyen" value={totals?.avg_seconds ? formatSeconds(Number(totals.avg_seconds)) : "—"} />
            <StatCard label="Erreurs moyennes" value={totals?.avg_mistakes ?? "—"} />
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold">Par niveau de difficulté</h2>
              <div className="mt-3 space-y-2">
                {byDifficulty.length === 0 && <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
                {byDifficulty.map((row) => (
                  <div key={String(row.difficulty)} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{row.difficulty}</span>
                    <span className="font-semibold">
                      {row.started} lancées · {row.won} gagnées
                      {row.avg_seconds ? ` · ~${formatSeconds(Number(row.avg_seconds))}` : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold">Appareils</h2>
              <div className="mt-3 space-y-2">
                {byDevice.length === 0 && <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
                {byDevice.map((row) => (
                  <div key={String(row.device)} className="flex items-center justify-between text-sm">
                    <span className="capitalize text-muted-foreground">{row.device}</span>
                    <span className="font-semibold">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold">Défi du jour — aujourd&apos;hui</h2>
            <div className="mt-3 grid grid-cols-3 gap-4">
              <StatCard label="Participants" value={Number(dailyStats?.participants ?? 0)} />
              <StatCard
                label="Temps moyen"
                value={dailyStats?.avg_seconds ? formatSeconds(Number(dailyStats.avg_seconds)) : "—"}
              />
              <StatCard
                label="Meilleur temps"
                value={dailyStats?.best_seconds ? formatSeconds(Number(dailyStats.best_seconds)) : "—"}
              />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-sm font-semibold">Tendance — 30 derniers jours</h2>
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

          <div className="mt-10 rounded-xl border border-dashed border-destructive/30 p-4">
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
        </>
      )}
    </Shell>
  )
}

function formatSeconds(total: number): string {
  const m = Math.floor(total / 60)
  const s = Math.round(total % 60)
  return `${m}m ${String(s).padStart(2, "0")}s`
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
  return <div className={`mx-auto w-full px-4 py-10 ${wide ? "max-w-4xl" : "max-w-sm"}`}>{children}</div>
}
