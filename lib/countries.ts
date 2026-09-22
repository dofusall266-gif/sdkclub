/** Transforme un code pays ISO 3166-1 alpha-2 (ex "FR") en emoji drapeau (🇫🇷). */
export function countryFlag(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️"
  const base = 0x1f1e6 // 'A' régional indicateur
  const chars = [...code].map((c) => base + (c.charCodeAt(0) - 65))
  return String.fromCodePoint(...chars)
}

export interface Country {
  code: string
  fr: string
  en: string
}

// Liste volontairement large mais non exhaustive (les pays les plus représentés
// sur ce type de site francophone). Facile à compléter si besoin.
export const COUNTRIES: Country[] = [
  { code: "FR", fr: "France", en: "France" },
  { code: "BE", fr: "Belgique", en: "Belgium" },
  { code: "CH", fr: "Suisse", en: "Switzerland" },
  { code: "CA", fr: "Canada", en: "Canada" },
  { code: "LU", fr: "Luxembourg", en: "Luxembourg" },
  { code: "MA", fr: "Maroc", en: "Morocco" },
  { code: "DZ", fr: "Algérie", en: "Algeria" },
  { code: "TN", fr: "Tunisie", en: "Tunisia" },
  { code: "SN", fr: "Sénégal", en: "Senegal" },
  { code: "CI", fr: "Côte d'Ivoire", en: "Ivory Coast" },
  { code: "CM", fr: "Cameroun", en: "Cameroon" },
  { code: "GB", fr: "Royaume-Uni", en: "United Kingdom" },
  { code: "IE", fr: "Irlande", en: "Ireland" },
  { code: "US", fr: "États-Unis", en: "United States" },
  { code: "DE", fr: "Allemagne", en: "Germany" },
  { code: "ES", fr: "Espagne", en: "Spain" },
  { code: "IT", fr: "Italie", en: "Italy" },
  { code: "PT", fr: "Portugal", en: "Portugal" },
  { code: "NL", fr: "Pays-Bas", en: "Netherlands" },
  { code: "PL", fr: "Pologne", en: "Poland" },
  { code: "SE", fr: "Suède", en: "Sweden" },
  { code: "NO", fr: "Norvège", en: "Norway" },
  { code: "DK", fr: "Danemark", en: "Denmark" },
  { code: "FI", fr: "Finlande", en: "Finland" },
  { code: "GR", fr: "Grèce", en: "Greece" },
  { code: "AT", fr: "Autriche", en: "Austria" },
  { code: "RO", fr: "Roumanie", en: "Romania" },
  { code: "TR", fr: "Turquie", en: "Turkey" },
  { code: "BR", fr: "Brésil", en: "Brazil" },
  { code: "MX", fr: "Mexique", en: "Mexico" },
  { code: "AR", fr: "Argentine", en: "Argentina" },
  { code: "JP", fr: "Japon", en: "Japan" },
  { code: "KR", fr: "Corée du Sud", en: "South Korea" },
  { code: "CN", fr: "Chine", en: "China" },
  { code: "IN", fr: "Inde", en: "India" },
  { code: "AU", fr: "Australie", en: "Australia" },
  { code: "NZ", fr: "Nouvelle-Zélande", en: "New Zealand" },
  { code: "ZA", fr: "Afrique du Sud", en: "South Africa" },
  { code: "EG", fr: "Égypte", en: "Egypt" },
  { code: "RU", fr: "Russie", en: "Russia" },
  { code: "UA", fr: "Ukraine", en: "Ukraine" },
]
