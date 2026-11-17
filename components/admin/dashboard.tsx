import { Delta, Empty, KpiCard, Section, formatSeconds } from "@/components/admin/dashboard-ui"
import { DonutChart, Heatmap, LineChart, VIZ, type DonutSlice } from "@/components/admin/charts"
import { StudioOverview } from "@/components/admin/studio-overview"
import { completion, type Breakdown, type Dashboard } from "@/lib/admin-stats"

const periodLabel = (days: number) =>
  days === 7 ? "7 derniers jours" : days === 30 ? "30 derniers jours" : days === 90 ? "90 derniers jours" : "12 derniers mois"

const formatHours = (seconds: number) => {
  const h = seconds / 3600
  return h >= 10 ? `${Math.round(h)} h` : `${h.toFixed(1).replace(".", ",")} h`
}

/** Une catégorie (source, appareil…) → une part d'anneau, avec son taux de réussite en détail. */
const toSlices = (rows: Breakdown[]): DonutSlice[] =>
  rows
    .filter((r) => r.started > 0)
    .map((r) => {
      const rate = completion(r.started, r.won)
      return { label: r.label, value: r.started, detail: rate === null ? undefined : `${rate} % terminées` }
    })

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

export function Dash({ d }: { d: Dashboard }) {
  const { cur, prev, retention, daily } = d
  const flawlessRate = completion(cur.won, cur.flawless)
  const prevFlawless = completion(prev.won, prev.flawless)
  const dailyShare = daily.wonTracked > 0 ? completion(daily.wonTracked, daily.participants) : null

  const noActivity = d.chart.every((p) => p.started + p.sessions + p.participants === 0)

  const outcome: DonutSlice[] = [
    { label: "Gagnées sans erreur", value: Math.min(cur.flawless, cur.won), color: VIZ[0] },
    { label: "Gagnées avec erreur(s)", value: Math.max(0, cur.won - cur.flawless), color: VIZ[2] },
    { label: "Abandonnées", value: Math.max(0, cur.started - cur.won), color: VIZ[1] },
  ]

  const levelRate = d.levels.map((l) => completion(l.started, l.won))
  const bandRate = d.ratingBands.map((b) => completion(b.started, b.won))
  const bandShort = d.ratingBands.map((b) => b.label.replace(/\s*\(.*\)/, "").replace(/\s/g, ""))

  return (
    <>
      {d.insights.length > 0 && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5">
          <h2 className="text-sm font-semibold">À retenir</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            {d.insights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <Section
        title={`Vue d'ensemble — ${periodLabel(d.days)}`}
        hint="Clique sur une mesure pour voir son évolution. Les flèches comparent avec la période juste avant, de même durée."
      >
        {noActivity ? (
          <Empty />
        ) : (
          <StudioOverview points={d.chart} prevPoints={d.prevChart} cur={cur} prev={prev} bucket={d.bucket} />
        )}
      </Section>

      <Section title="Quand jouent-ils ?" hint="Parties lancées selon le jour et l'heure (heure de Paris). Pour choisir le bon moment de publier ou d'annoncer quelque chose.">
        <Panel title="Activité par jour et par heure">
          {d.heat.flat().every((n) => n === 0) ? <Empty /> : <Heatmap grid={d.heat} unit="parties lancées" />}
        </Panel>
      </Section>

      <Section
        title="Engagement — combien de temps restent-ils ?"
        hint="Temps réellement passé sur le site : onglet visible et joueur actif (une minute sans clic ni touche n'est pas comptée)."
      >
        {cur.sessions === 0 ? (
          <Empty>La mesure du temps passé démarre avec cette version : reviens dans quelques jours.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard
              label="Temps moyen par visite"
              value={formatSeconds(Math.round(cur.playSeconds / cur.sessions))}
              help="Durée moyenne d'une ouverture du site."
              delta={<Delta cur={cur.playSeconds / cur.sessions} prev={prev.sessions > 0 ? prev.playSeconds / prev.sessions : null} />}
            />
            <KpiCard label="Visites" value={cur.sessions} help="Chaque ouverture du site compte pour une visite." delta={<Delta cur={cur.sessions} prev={prev.sessions} />} />
            <KpiCard label="Temps total passé" value={formatHours(cur.playSeconds)} help="Somme de toutes les visites." delta={<Delta cur={cur.playSeconds} prev={prev.playSeconds} />} />
            <KpiCard
              label="Parties par visite"
              value={(cur.started / cur.sessions).toFixed(1).replace(".", ",")}
              help="Au-dessus de 1, les gens enchaînent les grilles."
            />
          </div>
        )}
      </Section>

      <Section title="Fidélisation — est-ce que les joueurs reviennent ?" hint="C'est le chiffre le plus important pour un jeu quotidien. Basé sur les joueurs ayant accepté les cookies.">
        {retention.total === 0 ? (
          <Empty>Pas encore de joueur identifié : la mesure démarre avec cette version, il faut quelques jours de données.</Empty>
        ) : (
          <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
            <div className="grid grid-cols-2 gap-4">
              <KpiCard
                label="Taux de retour"
                value={retention.eligible > 0 ? `${completion(retention.eligible, retention.cameBack)} %` : "—"}
                help={`${retention.cameBack} nouveaux joueurs sur ${retention.eligible} sont revenus un autre jour.`}
              />
              <KpiCard
                label="Habitués"
                value={retention.regulars}
                help={`Actifs sur au moins 3 jours différents (${completion(retention.total, retention.regulars) ?? 0} % des joueurs identifiés).`}
              />
              <KpiCard label="Nouveaux joueurs" value={retention.newVisitors} help="Vus pour la première fois sur la période." />
              <KpiCard label="Joueurs revenus" value={retention.returningVisitors} help="Déjà connus avant la période, et de retour." />
            </div>
            <Panel title="Nouveaux ou de retour ?" hint="Répartition des joueurs identifiés de la période.">
              <DonutChart
                centerLabel="joueurs"
                ariaLabel="Nouveaux joueurs et joueurs revenus"
                slices={[
                  { label: "Nouveaux", value: retention.newVisitors, color: VIZ[0] },
                  { label: "Déjà connus", value: retention.returningVisitors, color: VIZ[1] },
                ]}
              />
            </Panel>
          </div>
        )}
      </Section>

      <Section title="Défi du jour" hint="Le moteur de retour quotidien. L'objectif : plus de participants, et beaucoup finissent sans erreur.">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Participations au classement" value={daily.participants} help={`${daily.players} joueurs différents.`} />
          <KpiCard label="Joueurs revenus au défi" value={daily.repeatPlayers} help="Inscrits au classement sur au moins 2 jours différents." />
          <KpiCard
            label="Sans erreur"
            value={daily.participants > 0 ? `${completion(daily.participants, daily.flawless)} %` : "—"}
            help="Part des participations sans aucune erreur."
          />
          <KpiCard
            label="Temps médian"
            value={formatSeconds(daily.medianSeconds)}
            help={daily.avgMistakes !== null ? `${daily.avgMistakes} erreurs en moyenne.` : "—"}
          />
        </div>
        {dailyShare !== null && (
          <p className="mt-3 text-sm text-muted-foreground">
            Sur les défis terminés, <span className="font-semibold text-foreground">{dailyShare} %</span> sont inscrits au classement.
          </p>
        )}
        <div className="mt-4">
          <Panel title="Le défi jour après jour" hint="Lancés et terminés sont mesurés depuis cette version ; « classés » vient du classement du défi.">
            {d.chart.every((p) => p.dailyStarted + p.dailyWon + p.participants === 0) ? (
              <Empty />
            ) : (
              <LineChart
                labels={d.chart.map((p) => p.label)}
                titles={d.chart.map((p) => p.title)}
                ariaLabel={`Défi du jour par ${d.bucket}`}
                height={240}
                series={[
                  { id: "ds", label: "Lancés", color: VIZ[3], values: d.chart.map((p) => p.dailyStarted) },
                  { id: "dw", label: "Terminés", color: VIZ[4], values: d.chart.map((p) => p.dailyWon) },
                  { id: "dp", label: "Classés", color: "var(--primary)", area: true, values: d.chart.map((p) => p.participants) },
                ]}
              />
            )}
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
              {[
                ["Lancés", VIZ[3]],
                ["Terminés", VIZ[4]],
                ["Classés", "var(--primary)"],
              ].map(([label, color]) => (
                <span key={label} className="inline-flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ background: color }} /> {label}
                </span>
              ))}
            </div>
          </Panel>
        </div>
      </Section>

      <Section title="Difficulté — où perd-on les joueurs ?" hint="Parties libres. Un niveau avec peu de réussite est trop dur, ou mal expliqué.">
        {d.levels.length === 0 ? (
          <Empty />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Comment finissent les parties ?" hint="Toutes les parties lancées sur la période.">
              <DonutChart slices={outcome} centerLabel="parties" ariaLabel="Issue des parties" />
              <p className="mt-3 text-xs text-muted-foreground">
                {flawlessRate === null ? "" : `${flawlessRate} % des parties gagnées le sont sans aucune erreur`}
                {prevFlawless !== null && flawlessRate !== null ? ` (${prevFlawless} % sur la période précédente).` : "."}
              </p>
            </Panel>
            <Panel title="Courbe de difficulté" hint="Part de parties terminées selon le niveau. Elle devrait descendre en allant vers les niveaux durs.">
              <LineChart
                labels={d.levels.map((l) => l.label)}
                ariaLabel="Réussite selon le niveau"
                height={240}
                dots
                yMax={100}
                valueFormat="percent"
                series={[{ id: "level", label: "Terminées", color: "var(--primary)", area: true, values: levelRate }]}
                extras={d.levels.map((l) => (
                  <p key={l.difficulty} className="border-t border-border pt-1 text-muted-foreground">
                    {l.won}/{l.started} parties · {formatSeconds(l.avgSeconds)} · {l.avgMistakes ?? "—"} err.
                  </p>
                ))}
              />
            </Panel>
            {d.ratingBands.length > 0 && (
              <div className="lg:col-span-2">
                <Panel
                  title="Réussite selon la note de la grille"
                  hint="Vérifie que plus la note monte, plus la réussite baisse : sinon la note ne reflète pas le ressenti des joueurs."
                >
                  <LineChart
                    labels={bandShort}
                    titles={d.ratingBands.map((b) => `Note ${b.label}`)}
                    ariaLabel="Réussite selon la note de la grille"
                    height={220}
                    dots
                    yMax={100}
                    valueFormat="percent"
                    series={[{ id: "band", label: "Terminées", color: VIZ[1], area: true, values: bandRate }]}
                    extras={d.ratingBands.map((b) => (
                      <p key={b.label} className="border-t border-border pt-1 text-muted-foreground">
                        {b.won}/{b.started} parties
                      </p>
                    ))}
                  />
                </Panel>
              </div>
            )}
          </div>
        )}
      </Section>

      <Section title="D'où viennent les joueurs ?" hint="Pour savoir où investir ton temps : YouTube, Facebook, X, Google, partages entre joueurs…">
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Sources" hint="Part des parties lancées, et taux de parties terminées pour chaque source.">
            {toSlices(d.sources).length === 0 ? <Empty /> : <DonutChart slices={toSlices(d.sources)} centerLabel="parties" ariaLabel="Sources des joueurs" />}
            <p className="mt-3 text-xs text-muted-foreground">
              « direct » = lien tapé, favori ou application sans origine détectable. Pour suivre une publication, mets
              <code className="mx-1 rounded bg-muted px-1">?utm_source=nom</code>à la fin du lien.
            </p>
          </Panel>
          <Panel title="Appareils" hint="Mobile, ordinateur, tablette.">
            {toSlices(d.devices).length === 0 ? <Empty /> : <DonutChart slices={toSlices(d.devices)} centerLabel="parties" ariaLabel="Appareils des joueurs" />}
          </Panel>
        </div>
      </Section>
    </>
  )
}
