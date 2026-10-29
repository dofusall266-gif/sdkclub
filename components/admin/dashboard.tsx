import { Delta, Empty, KpiCard, RateRow, Section, formatSeconds } from "@/components/admin/dashboard-ui"
import { TrendChart } from "@/components/admin/trend-chart"
import { completion, type Dashboard } from "@/lib/admin-stats"

export function Dash({ d }: { d: Dashboard }) {
  const { cur, prev, retention, daily } = d
  const rate = completion(cur.started, cur.won)
  const prevRate = completion(prev.started, prev.won)
  const flawlessRate = completion(cur.won, cur.flawless)
  const prevFlawless = completion(prev.won, prev.flawless)
  const dailyShare = daily.wonTracked > 0 ? completion(daily.wonTracked, daily.participants) : null

  return (
    <>
      {d.insights.length > 0 && (
        <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <h2 className="text-sm font-semibold">À retenir</h2>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm">
            {d.insights.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <Section
        title={`Vue d'ensemble — ${d.days} derniers jours`}
        hint="Les flèches comparent avec la période juste avant, de même durée."
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <KpiCard
            label="Parties lancées"
            value={cur.started}
            help="Compte dès 2 chiffres posés (libre + défi du jour)."
            delta={<Delta cur={cur.started} prev={prev.started} />}
          />
          <KpiCard
            label="Parties terminées"
            value={rate === null ? "—" : `${rate} %`}
            help={`${cur.won} gagnées sur ${cur.started} lancées. En dessous de 50 %, on perd trop de joueurs en route.`}
            delta={<Delta cur={rate} prev={prevRate} unit="pts" />}
          />
          <KpiCard
            label="Joueurs identifiés"
            value={cur.visitors}
            help="Seulement ceux qui ont accepté les cookies : un minimum, pas le total des visiteurs."
            delta={<Delta cur={cur.visitors} prev={prev.visitors} />}
          />
          <KpiCard
            label="Parties sans erreur"
            value={flawlessRate === null ? "—" : `${flawlessRate} %`}
            help="Part des parties gagnées sans aucune erreur. Très bas = grilles trop dures ou trop de tâtonnement."
            delta={<Delta cur={flawlessRate} prev={prevFlawless} unit="pts" />}
          />
          <KpiCard
            label="Temps moyen d'une victoire"
            value={formatSeconds(cur.avgSeconds)}
            help="Sur les parties gagnées uniquement."
          />
          <KpiCard
            label="Erreurs par victoire"
            value={cur.avgMistakes ?? "—"}
            help="Moyenne sur les parties gagnées."
            delta={<Delta cur={cur.avgMistakes} prev={prev.avgMistakes} good="down" />}
          />
        </div>
        <div className="mt-6">
          {d.trend.every((p) => p.started === 0) ? <Empty /> : <TrendChart points={d.trend} />}
        </div>
      </Section>

      <Section
        title="Fidélisation — est-ce que les joueurs reviennent ?"
        hint="C'est le chiffre le plus important pour un jeu quotidien. Basé sur les joueurs ayant accepté les cookies."
      >
        {retention.total === 0 ? (
          <Empty>Pas encore de joueur identifié : la mesure démarre avec cette version, il faut quelques jours de données.</Empty>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiCard label="Nouveaux joueurs" value={retention.newVisitors} help="Vus pour la première fois sur la période." />
            <KpiCard label="Joueurs revenus" value={retention.returningVisitors} help="Déjà vus avant la période, et de retour." />
            <KpiCard
              label="Reviennent un autre jour"
              value={retention.eligible > 0 ? `${completion(retention.eligible, retention.cameBack)} %` : "—"}
              help={`${retention.cameBack} sur ${retention.eligible} nouveaux joueurs ont rejoué un autre jour.`}
            />
            <KpiCard label="Joueurs réguliers" value={retention.regulars} help="Actifs sur au moins 3 jours différents." />
          </div>
        )}
      </Section>

      <Section
        title="Défi du jour"
        hint="Le moteur de retour quotidien. L'objectif : plus de participants, et beaucoup finissent sans erreur."
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Participations au classement" value={daily.participants} help={`${daily.players} joueurs différents.`} />
          <KpiCard
            label="Joueurs revenus au défi"
            value={daily.repeatPlayers}
            help="Inscrits au classement sur au moins 2 jours différents."
          />
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
            Sur les défis terminés, <span className="font-semibold text-foreground">{dailyShare} %</span> s&apos;inscrivent au
            classement.
          </p>
        )}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="py-1.5 font-medium">Jour</th>
                <th className="py-1.5 text-right font-medium">Lancés</th>
                <th className="py-1.5 text-right font-medium">Terminés</th>
                <th className="py-1.5 text-right font-medium">Classés</th>
              </tr>
            </thead>
            <tbody>
              {daily.last7.map((r) => (
                <tr key={r.day} className="border-t border-border">
                  <td className="py-1.5">{r.day}</td>
                  <td className="py-1.5 text-right tabular-nums">{r.started || "—"}</td>
                  <td className="py-1.5 text-right tabular-nums">{r.won || "—"}</td>
                  <td className="py-1.5 text-right tabular-nums font-semibold">{r.participants}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">
            « Lancés » et « Terminés » sont mesurés depuis cette version ; « Classés » vient du classement du défi.
          </p>
        </div>
      </Section>

      <Section
        title="Difficulté — où perd-on les joueurs ?"
        hint="Parties libres. Un niveau avec peu de réussite est trop dur, ou mal expliqué."
      >
        {d.levels.length === 0 ? (
          <Empty />
        ) : (
          <div className="space-y-3">
            {d.levels.map((l) => (
              <RateRow
                key={l.difficulty}
                label={l.label}
                started={l.started}
                won={l.won}
                extra={`${formatSeconds(l.avgSeconds)} · ${l.avgMistakes ?? "—"} err.`}
              />
            ))}
          </div>
        )}
        {d.ratingBands.length > 0 && (
          <>
            <h3 className="mt-6 text-sm font-semibold">Réussite selon la note de la grille</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Vérifie que plus la note monte, plus la réussite baisse : sinon la note ne reflète pas le ressenti des joueurs.
            </p>
            <div className="mt-3 space-y-3">
              {d.ratingBands.map((b) => (
                <RateRow key={b.label} label={b.label} started={b.started} won={b.won} />
              ))}
            </div>
          </>
        )}
      </Section>

      <Section
        title="D'où viennent les joueurs ?"
        hint="Pour savoir où investir ton temps : YouTube, Facebook, X, Google, partages entre joueurs…"
      >
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold">Sources</h3>
            <div className="mt-3 space-y-3">
              {d.sources.length === 0 ? <Empty /> : d.sources.map((x) => <RateRow key={x.label} label={x.label} started={x.started} won={x.won} />)}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              « direct » = lien tapé, favori ou application sans origine détectable. Pour suivre une publication, mets
              <code className="mx-1 rounded bg-muted px-1">?utm_source=nom</code>à la fin du lien.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold">Appareils</h3>
            <div className="mt-3 space-y-3">
              {d.devices.length === 0 ? <Empty /> : d.devices.map((x) => <RateRow key={x.label} label={x.label} started={x.started} won={x.won} />)}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Chaque barre = part des parties lancées qui sont allées jusqu&apos;au bout.</p>
      </Section>
    </>
  )
}
