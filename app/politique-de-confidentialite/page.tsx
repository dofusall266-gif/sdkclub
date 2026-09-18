import type { Metadata } from "next"

import { PageLayout } from "@/components/page-layout"

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité de Sudoku Club : données collectées, cookies, mesure d'audience et vos droits.",
  alternates: { canonical: "/politique-de-confidentialite" },
}

export default function PrivacyPage() {
  return (
    <PageLayout>
      <article className="max-w-3xl space-y-8">
        <header>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Politique de confidentialité</h1>
          <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : {new Date().getFullYear()}</p>
        </header>

        <Section title="1. Introduction">
          <p>
            La présente politique de confidentialité décrit la manière dont Sudoku Club (« nous ») traite les
            informations lorsque vous utilisez notre site. Nous accordons une grande importance au respect de votre vie
            privée et à la protection de vos données personnelles.
          </p>
        </Section>

        <Section title="2. Données collectées">
          <p>
            Le jeu de sudoku fonctionne entièrement dans votre navigateur et ne nécessite aucune inscription. Nous ne
            collectons pas de données personnelles identifiantes pour jouer. Certaines préférences (comme le thème clair
            ou sombre) sont stockées localement sur votre appareil.
          </p>
        </Section>

        <Section title="3. Cookies et mesure d'audience">
          <p>
            Nous pouvons utiliser des cookies afin de mesurer l&apos;audience du site et d&apos;afficher des publicités
            adaptées. Vous pouvez accepter ou refuser ces cookies via la bannière de consentement affichée lors de votre
            première visite, et modifier votre choix à tout moment.
          </p>
        </Section>

        <Section title="4. Publicité">
          <p>
            Ce site peut afficher des publicités fournies par des régies tierces. Ces partenaires sont susceptibles
            d&apos;utiliser des cookies pour proposer des annonces pertinentes. Aucune donnée sensible n&apos;est
            partagée.
          </p>
        </Section>

        <Section title="5. Vos droits">
          <p>
            Conformément à la réglementation applicable (notamment le RGPD), vous disposez d&apos;un droit d&apos;accès,
            de rectification et de suppression de vos données. Pour toute demande, contactez-nous via la page Contact.
          </p>
        </Section>

        <Section title="6. Contact">
          <p>
            Pour toute question relative à cette politique de confidentialité, vous pouvez nous écrire depuis la page
            Contact du site.
          </p>
        </Section>
      </article>
    </PageLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}
