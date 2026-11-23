import type { Metadata } from "next"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button"
import { isAdminAuthed } from "@/lib/admin-auth"
import { countryFlag } from "@/lib/countries"
import { ensureAccountsTable, ensureDailyScoresTable, ensurePointsTable, getDb } from "@/lib/db"
import { mergePlayers } from "@/lib/merge-players"

export const metadata: Metadata = {
  title: "Gérer les joueurs",
  robots: { index: false, follow: false },
}

interface PlayerRow {
  player_id: string
  pseudo: string
  country_code: string | null
  total: number
  parties: number
  debut: string | Date
  fin: string | Date
  linked: boolean
}

const BASE = "/admin/joueurs"

function done(type: "ok" | "err", msg: string): never {
  redirect(`${BASE}?${type}=${encodeURIComponent(msg)}`)
}

/** Fusion de deux joueurs choisis à la main. */
async function mergeManual(formData: FormData) {
  "use server"
  if (!(await isAdminAuthed())) done("err", "Session expirée : reconnecte-toi sur /admin.")
  const sql = getDb()
  if (!sql) done("err", "Base de données indisponible.")
  const oldId = String(formData.get("old") ?? "")
  const keepId = String(formData.get("keep") ?? "")
  const pseudo = String(formData.get("pseudo") ?? "").trim()
  let message = ""
  try {
    const r = await mergePlayers(sql, oldId, keepId, pseudo || undefined)
    message = `Fusion réussie : ${r.games} partie(s) et ${r.daily} défi(s) rattachés à « ${r.pseudo} ».`
  } catch (e) {
    done("err", e instanceof Error ? e.message : "Fusion impossible.")
  }
  revalidatePath(BASE)
  done("ok", message)
}

/** Fusion d'un groupe de doublons (même pseudo) dans le joueur à garder. */
async function mergeGroup(formData: FormData) {
  "use server"
  if (!(await isAdminAuthed())) done("err", "Session expirée : reconnecte-toi sur /admin.")
  const sql = getDb()
  if (!sql) done("err", "Base de données indisponible.")
  const keepId = String(formData.get("keep") ?? "")
  const ids = String(formData.get("ids") ?? "")
    .split(",")
    .filter((id) => id && id !== keepId)
  let games = 0
  let daily = 0
  let pseudo = ""
  try {
    for (const id of ids) {
      const r = await mergePlayers(sql, id, keepId)
      games += r.games
      daily += r.daily
      pseudo = r.pseudo
    }
  } catch (e) {
    done("err", e instanceof Error ? e.message : "Fusion impossible.")
  }
  revalidatePath(BASE)
  done("ok", `Doublons fusionnés : ${games} partie(s) et ${daily} défi(s) rattachés à « ${pseudo} ».`)
}

async function loadPlayers(): Promise<PlayerRow[]> {
  const sql = getDb()
  if (!sql) return []
  await ensurePointsTable(sql)
  await ensureDailyScoresTable(sql)
  await ensureAccountsTable(sql)
  return (await sql`
    WITH rows_all AS (
      SELECT player_id, pseudo, country_code, points, created_at FROM points_scores
      UNION ALL
      SELECT player_id, pseudo, country_code, 0 AS points, created_at FROM daily_scores
    )
    SELECT
      r.player_id,
      (array_agg(r.pseudo ORDER BY r.created_at DESC))[1] AS pseudo,
      (array_agg(r.country_code ORDER BY r.created_at DESC))[1] AS country_code,
      COALESCE(SUM(r.points), 0)::int AS total,
      COUNT(*) FILTER (WHERE r.points > 0)::int AS parties,
      MIN(r.created_at) AS debut,
      MAX(r.created_at) AS fin,
      EXISTS (SELECT 1 FROM accounts a WHERE a.player_id = r.player_id) AS linked
    FROM rows_all r
    GROUP BY r.player_id
    ORDER BY total DESC, fin DESC
    LIMIT 500
  `) as PlayerRow[]
}

const fmt = (d: string | Date) => new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })

function label(p: PlayerRow): string {
  return `${p.country_code ? countryFlag(p.country_code) + " " : ""}${p.pseudo} — ${p.total} pts · ${p.parties} partie(s) · dernière activité ${fmt(p.fin)}${p.linked ? " · 🔗 compte Google" : ""}`
}

export default async function PlayersPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const { ok, err } = await searchParams

  if (!(await isAdminAuthed())) {
    return (
      <Shell>
        <h1 className="text-xl font-bold">Accès privé</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Connecte-toi d&apos;abord sur <a className="underline" href="/admin">la page admin</a>, puis reviens ici.
        </p>
      </Shell>
    )
  }

  let players: PlayerRow[] = []
  let dbError = false
  try {
    players = await loadPlayers()
  } catch {
    dbError = true
  }

  // Groupes de doublons : plusieurs identifiants avec le même pseudo (sans tenir compte de la casse).
  const groups = new Map<string, PlayerRow[]>()
  for (const p of players) {
    const key = p.pseudo.trim().toLowerCase()
    groups.set(key, [...(groups.get(key) ?? []), p])
  }
  const duplicates = [...groups.values()].filter((g) => g.length > 1)

  return (
    <Shell>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Gérer les joueurs</h1>
        <a href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Statistiques
        </a>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Rassemble les points d&apos;un joueur qui a perdu son compte, ou fusionne les doublons. Une fusion est définitive.
      </p>

      {ok && <p className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm">{ok}</p>}
      {err && <p className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
      {dbError && <p className="mt-4 text-sm text-destructive">Impossible de lire la base de données.</p>}

      <section className="mt-8">
        <h2 className="text-lg font-semibold">1. Doublons détectés ({duplicates.length})</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Plusieurs identifiants portent le même pseudo. Attention : deux personnes différentes peuvent choisir le même pseudo.
          Vérifie les dates avant de fusionner : un vrai doublon (cache vidé) a des périodes qui se suivent.
        </p>
        {duplicates.length === 0 && <p className="mt-3 text-sm text-muted-foreground">Aucun doublon pour le moment 🎉</p>}
        <div className="mt-3 space-y-4">
          {duplicates.map((group) => {
            const linkedCount = group.filter((p) => p.linked).length
            const defaultKeep =
              group.find((p) => p.linked) ??
              [...group].sort((a, b) => new Date(b.fin).getTime() - new Date(a.fin).getTime())[0]
            return (
              <form key={group[0].player_id} action={mergeGroup} className="rounded-xl border border-border bg-card p-4">
                <input type="hidden" name="ids" value={group.map((p) => p.player_id).join(",")} />
                <p className="text-sm font-semibold">« {group[0].pseudo} » — {group.length} identifiants</p>
                <fieldset className="mt-2 space-y-1.5">
                  <legend className="mb-1 text-xs text-muted-foreground">Garder :</legend>
                  {group.map((p) => (
                    <label key={p.player_id} className="flex items-start gap-2 text-sm">
                      <input type="radio" name="keep" value={p.player_id} defaultChecked={p.player_id === defaultKeep.player_id} className="mt-1" />
                      <span>
                        {label(p)}
                        <span className="block text-xs text-muted-foreground">
                          du {fmt(p.debut)} au {fmt(p.fin)}
                        </span>
                      </span>
                    </label>
                  ))}
                </fieldset>
                {linkedCount > 1 ? (
                  <p className="mt-3 text-xs text-destructive">
                    Plusieurs de ces identifiants ont un compte Google : fusion impossible (ce sont probablement des personnes différentes).
                  </p>
                ) : (
                  <ConfirmSubmitButton
                    label="Fusionner en un seul joueur"
                    confirmText="Rassembler tous ces identifiants en un seul (celui coché) ? Cette action est irréversible."
                    className="mt-3 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  />
                )}
              </form>
            )
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">2. Récupérer un ancien compte (fusion manuelle)</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Choisis l&apos;ancien joueur dont tu veux récupérer les points, puis le joueur actuel qui les recevra (celui avec 🔗 si tu
          t&apos;es connecté avec Google).
        </p>
        <form action={mergeManual} className="mt-3 space-y-3 rounded-xl border border-border bg-card p-4">
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Ancien joueur (ses points seront déplacés)</span>
            <select name="old" required defaultValue="" className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="" disabled>— Choisir —</option>
              {players.filter((p) => !p.linked).map((p) => (
                <option key={p.player_id} value={p.player_id}>{label(p)}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Joueur à garder (il reçoit les points)</span>
            <select name="keep" required defaultValue="" className="w-full rounded-lg border border-border bg-background px-2 py-2 text-sm">
              <option value="" disabled>— Choisir —</option>
              {players.map((p) => (
                <option key={p.player_id} value={p.player_id}>{label(p)}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Pseudo à afficher après la fusion (facultatif)</span>
            <input name="pseudo" maxLength={20} placeholder="Laisser vide pour garder le pseudo du joueur conservé" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
          </label>
          <ConfirmSubmitButton
            label="Fusionner"
            confirmText="Déplacer tous les points de l'ancien joueur vers le joueur conservé ? Cette action est irréversible."
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          />
        </form>
        {players.length >= 500 && (
          <p className="mt-2 text-xs text-muted-foreground">Liste limitée aux 500 joueurs ayant le plus de points.</p>
        )}
      </section>
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-3xl px-4 py-10">{children}</div>
}
