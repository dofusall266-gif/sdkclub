import type { getDb } from "@/lib/db"
import { DIFFICULTIES, DIFFICULTY_LABELS, type Difficulty } from "@/lib/sudoku"

type Sql = NonNullable<ReturnType<typeof getDb>>
type Row = Record<string, string | number | null>

const num = (v: unknown) => Number(v ?? 0)

export interface Kpi {
  started: number
  won: number
  visitors: number
  avgSeconds: number | null
  avgMistakes: number | null
  flawless: number
}

export interface TrendPoint {
  day: string
  started: number
  won: number
}

export interface LevelRow {
  difficulty: string
  label: string
  started: number
  won: number
  avgSeconds: number | null
  avgMistakes: number | null
  flawless: number
}

export interface Breakdown {
  label: string
  started: number
  won: number
  visitors: number
}

export interface Retention {
  total: number
  newVisitors: number
  returningVisitors: number
  eligible: number
  cameBack: number
  regulars: number
}

export interface DailyDay {
  day: string
  participants: number
  started: number
  won: number
}

export interface DailyStats {
  participants: number
  players: number
  repeatPlayers: number
  flawless: number
  avgMistakes: number | null
  medianSeconds: number | null
  startedTracked: number
  wonTracked: number
  last7: DailyDay[]
}

export interface Dashboard {
  days: number
  cur: Kpi
  prev: Kpi
  trend: TrendPoint[]
  levels: LevelRow[]
  ratingBands: Breakdown[]
  sources: Breakdown[]
  devices: Breakdown[]
  retention: Retention
  daily: DailyStats
  insights: string[]
}

export const RATING_BAND_LABELS = ["1 – 20 (très facile)", "21 – 40", "41 – 60", "61 – 80", "81 – 100 (très dur)"]

async function kpi(sql: Sql, from: string, to: string): Promise<Kpi> {
  const r = (
    await sql`
      SELECT
        count(*) FILTER (WHERE type = 'game_started') AS started,
        count(*) FILTER (WHERE type = 'game_won') AS won,
        count(DISTINCT visitor_id) AS visitors,
        round(avg(duration_seconds) FILTER (WHERE type = 'game_won')) AS avg_seconds,
        round(avg(mistakes) FILTER (WHERE type = 'game_won'), 1) AS avg_mistakes,
        count(*) FILTER (WHERE type = 'game_won' AND mistakes = 0) AS flawless
      FROM events
      WHERE created_at >= ${from}::timestamptz AND created_at < ${to}::timestamptz
    `
  )[0] as Row
  return {
    started: num(r.started),
    won: num(r.won),
    visitors: num(r.visitors),
    avgSeconds: r.avg_seconds === null ? null : num(r.avg_seconds),
    avgMistakes: r.avg_mistakes === null ? null : num(r.avg_mistakes),
    flawless: num(r.flawless),
  }
}

export const completion = (started: number, won: number) => (started > 0 ? Math.min(100, Math.round((won / started) * 100)) : null)

export async function loadDashboard(sql: Sql, days: number): Promise<Dashboard> {
  const now = Date.now()
  const iso = (ms: number) => new Date(ms).toISOString()
  const from = iso(now - days * 86_400_000)
  const prevFrom = iso(now - 2 * days * 86_400_000)
  const to = iso(now + 60_000)

  const [cur, prev] = await Promise.all([kpi(sql, from, to), kpi(sql, prevFrom, from)])

  const trend = ((await sql`
    SELECT to_char(d::date, 'DD/MM') AS day, coalesce(s.started, 0) AS started, coalesce(s.won, 0) AS won
    FROM generate_series(current_date - ${days - 1}::int, current_date, '1 day') d
    LEFT JOIN (
      SELECT created_at::date AS day,
             count(*) FILTER (WHERE type = 'game_started') AS started,
             count(*) FILTER (WHERE type = 'game_won') AS won
      FROM events WHERE created_at >= current_date - ${days - 1}::int GROUP BY 1
    ) s ON s.day = d::date
    ORDER BY d
  `) as Row[]).map((r) => ({ day: String(r.day), started: num(r.started), won: num(r.won) }))

  const levelRows = (await sql`
    SELECT difficulty,
      count(*) FILTER (WHERE type = 'game_started') AS started,
      count(*) FILTER (WHERE type = 'game_won') AS won,
      round(avg(duration_seconds) FILTER (WHERE type = 'game_won')) AS avg_seconds,
      round(avg(mistakes) FILTER (WHERE type = 'game_won'), 1) AS avg_mistakes,
      count(*) FILTER (WHERE type = 'game_won' AND mistakes = 0) AS flawless
    FROM events
    WHERE created_at >= ${from}::timestamptz AND difficulty IS NOT NULL AND coalesce(mode, 'free') = 'free'
    GROUP BY difficulty
  `) as Row[]
  const order = (d: string) => {
    const i = DIFFICULTIES.indexOf(d as Difficulty)
    return i === -1 ? 99 : i
  }
  const levels: LevelRow[] = levelRows
    .map((r) => ({
      difficulty: String(r.difficulty),
      label: DIFFICULTY_LABELS[r.difficulty as Difficulty] ?? String(r.difficulty),
      started: num(r.started),
      won: num(r.won),
      avgSeconds: r.avg_seconds === null ? null : num(r.avg_seconds),
      avgMistakes: r.avg_mistakes === null ? null : num(r.avg_mistakes),
      flawless: num(r.flawless),
    }))
    .sort((a, b) => order(a.difficulty) - order(b.difficulty))

  const bandRows = (await sql`
    SELECT least(4, (rating - 1) / 20) AS band,
      count(*) FILTER (WHERE type = 'game_started') AS started,
      count(*) FILTER (WHERE type = 'game_won') AS won
    FROM events
    WHERE created_at >= ${from}::timestamptz AND rating IS NOT NULL
    GROUP BY 1 ORDER BY 1
  `) as Row[]
  const ratingBands: Breakdown[] = bandRows.map((r) => ({
    label: RATING_BAND_LABELS[num(r.band)] ?? String(r.band),
    started: num(r.started),
    won: num(r.won),
    visitors: 0,
  }))

  const breakdown = async (column: "source" | "device"): Promise<Breakdown[]> => {
    const rows =
      column === "source"
        ? await sql`
            SELECT coalesce(source, 'inconnue') AS label,
              count(*) FILTER (WHERE type = 'game_started') AS started,
              count(*) FILTER (WHERE type = 'game_won') AS won,
              count(DISTINCT visitor_id) AS visitors
            FROM events WHERE created_at >= ${from}::timestamptz
            GROUP BY 1 ORDER BY started DESC, won DESC LIMIT 8`
        : await sql`
            SELECT coalesce(device, 'inconnu') AS label,
              count(*) FILTER (WHERE type = 'game_started') AS started,
              count(*) FILTER (WHERE type = 'game_won') AS won,
              count(DISTINCT visitor_id) AS visitors
            FROM events WHERE created_at >= ${from}::timestamptz
            GROUP BY 1 ORDER BY started DESC, won DESC LIMIT 8`
    return (rows as Row[]).map((r) => ({
      label: String(r.label),
      started: num(r.started),
      won: num(r.won),
      visitors: num(r.visitors),
    }))
  }
  const [sources, devices] = await Promise.all([breakdown("source"), breakdown("device")])

  const rt = (
    await sql`
      WITH v AS (
        SELECT visitor_id, min(created_at::date) AS first_day, count(DISTINCT created_at::date) AS days_active
        FROM events WHERE visitor_id IS NOT NULL GROUP BY visitor_id
      ), w AS (
        SELECT DISTINCT visitor_id FROM events WHERE visitor_id IS NOT NULL AND created_at >= ${from}::timestamptz
      )
      SELECT
        count(*) AS total,
        count(*) FILTER (WHERE v.first_day >= current_date - ${days}::int) AS new_visitors,
        count(*) FILTER (WHERE v.first_day < current_date - ${days}::int) AS returning_visitors,
        count(*) FILTER (WHERE v.first_day >= current_date - ${days}::int AND v.first_day < current_date) AS eligible,
        count(*) FILTER (WHERE v.first_day >= current_date - ${days}::int AND v.first_day < current_date AND v.days_active >= 2) AS came_back,
        count(*) FILTER (WHERE v.days_active >= 3) AS regulars
      FROM v JOIN w ON w.visitor_id = v.visitor_id
    `
  )[0] as Row
  const retention: Retention = {
    total: num(rt.total),
    newVisitors: num(rt.new_visitors),
    returningVisitors: num(rt.returning_visitors),
    eligible: num(rt.eligible),
    cameBack: num(rt.came_back),
    regulars: num(rt.regulars),
  }

  const dailyAgg = (
    await sql`
      SELECT count(*) AS participants, count(DISTINCT player_id) AS players,
        count(*) FILTER (WHERE mistakes = 0) AS flawless,
        round(avg(mistakes), 1) AS avg_mistakes,
        round(percentile_cont(0.5) WITHIN GROUP (ORDER BY seconds)) AS median_seconds
      FROM daily_scores WHERE date >= current_date - ${days}::int
    `
  )[0] as Row
  const repeat = (
    await sql`
      SELECT count(*) FILTER (WHERE n >= 2) AS repeat_players
      FROM (SELECT player_id, count(DISTINCT date) AS n FROM daily_scores WHERE date >= current_date - ${days}::int GROUP BY player_id) t
    `
  )[0] as Row
  const tracked = (
    await sql`
      SELECT count(*) FILTER (WHERE type = 'game_started') AS started, count(*) FILTER (WHERE type = 'game_won') AS won
      FROM events WHERE mode = 'daily' AND created_at >= ${from}::timestamptz
    `
  )[0] as Row
  const last7 = ((await sql`
    SELECT to_char(d::date, 'DD/MM') AS day,
      (SELECT count(*) FROM daily_scores s WHERE s.date = d::date) AS participants,
      (SELECT count(*) FROM events e WHERE e.mode = 'daily' AND e.type = 'game_started' AND e.created_at::date = d::date) AS started,
      (SELECT count(*) FROM events e WHERE e.mode = 'daily' AND e.type = 'game_won' AND e.created_at::date = d::date) AS won
    FROM generate_series(current_date - 6, current_date, '1 day') d ORDER BY d DESC
  `) as Row[]).map((r) => ({ day: String(r.day), participants: num(r.participants), started: num(r.started), won: num(r.won) }))
  const daily: DailyStats = {
    participants: num(dailyAgg.participants),
    players: num(dailyAgg.players),
    repeatPlayers: num(repeat.repeat_players),
    flawless: num(dailyAgg.flawless),
    avgMistakes: dailyAgg.avg_mistakes === null ? null : num(dailyAgg.avg_mistakes),
    medianSeconds: dailyAgg.median_seconds === null ? null : num(dailyAgg.median_seconds),
    startedTracked: num(tracked.started),
    wonTracked: num(tracked.won),
    last7,
  }

  const dash: Dashboard = { days, cur, prev, trend, levels, ratingBands, sources, devices, retention, daily, insights: [] }
  dash.insights = buildInsights(dash)
  return dash
}

const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0)

/** Quelques phrases en clair, tirées des chiffres, pour savoir où agir en priorité. */
function buildInsights(d: Dashboard): string[] {
  const out: string[] = []
  const { cur, prev, levels, devices, sources, retention, daily } = d

  if (cur.started < 20) {
    out.push(
      `Peu de parties sur la période (${cur.started}) : les pourcentages ci-dessous bougent beaucoup avec si peu de données, lis-les comme des indices et pas comme des certitudes.`,
    )
  }

  const rate = completion(cur.started, cur.won)
  if (rate !== null && cur.started >= 20) {
    if (rate < 50) {
      out.push(`Moins d'une partie sur deux va au bout (${rate} %). C'est le premier chiffre à améliorer : regarde le tableau des niveaux pour voir où les joueurs abandonnent.`)
    } else if (rate >= 70) {
      out.push(`${rate} % des parties lancées sont terminées : les joueurs vont au bout, la difficulté semble bien réglée.`)
    }
  }

  const worst = levels
    .filter((l) => l.started >= 10)
    .map((l) => ({ ...l, rate: completion(l.started, l.won) ?? 100 }))
    .sort((a, b) => a.rate - b.rate)[0]
  if (worst && worst.rate < 50) {
    out.push(`Le niveau ${worst.label} est celui où l'on abandonne le plus : ${worst.rate} % de réussite sur ${worst.started} parties.`)
  }

  const mobile = devices.find((x) => x.label === "mobile")
  const desktop = devices.find((x) => x.label === "desktop")
  if (mobile && desktop && mobile.started >= 10 && desktop.started >= 10) {
    const gap = (completion(desktop.started, desktop.won) ?? 0) - (completion(mobile.started, mobile.won) ?? 0)
    if (gap >= 15) {
      out.push(`Sur mobile, on termine ${gap} points de moins que sur ordinateur : vérifie le confort de jeu sur téléphone (taille des cases, pavé de chiffres).`)
    }
  }

  const topSource = sources.find((s) => s.label !== "inconnue" && s.started >= 5)
  if (topSource) {
    out.push(`Première source de joueurs : ${topSource.label} (${topSource.started} parties lancées). Continue à l'alimenter.`)
  }

  if (retention.eligible >= 5) {
    const back = pct(retention.cameBack, retention.eligible)
    out.push(
      back < 20
        ? `Seuls ${back} % des nouveaux joueurs reviennent un autre jour : le défi du jour et le partage du résultat sont tes meilleurs leviers pour les faire revenir.`
        : `${back} % des nouveaux joueurs reviennent un autre jour : c'est un bon signe de fidélisation.`,
    )
  }

  if (daily.startedTracked >= 5 && daily.participants >= 0) {
    const share = pct(daily.participants, daily.wonTracked || daily.startedTracked)
    if (share < 40) {
      out.push(`Peu de gens qui finissent le défi du jour s'inscrivent au classement (${share} %) : le choix du pseudo est peut-être un frein, à simplifier.`)
    }
  }
  if (daily.participants >= 5 && daily.flawless === 0) {
    out.push("Personne n'a fini le défi du jour sans erreur sur la période : la grille est peut-être trop difficile pour la plupart des joueurs.")
  }

  if (prev.started >= 10 && cur.started > prev.started * 1.5) {
    out.push(`L'activité progresse nettement (${cur.started} parties contre ${prev.started} sur la période précédente).`)
  }
  return out.slice(0, 5)
}
