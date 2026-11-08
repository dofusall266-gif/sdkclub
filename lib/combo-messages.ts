import type { Locale } from "@/lib/i18n/dictionaries"

/** Messages d'encouragement par palier de combo (3, 7, 10, 20) : un est tiré au hasard pour ne pas lasser. */
const MESSAGES: Record<Locale, Record<number, string[]>> = {
  fr: {
    3: ["Bien joué 😎", "Bravo 🤩", "Super 🙌", "Continue ! 💪"],
    7: ["Impréééssionnant 🤓", "Sublime 🤝", "Magnifiiique 🤩"],
    10: ["Légeeeeendaire ⚡️", "Incroyaaable 🤯", "Sensationnel 🐺"],
    20: ["Divin 🌬️"],
  },
  en: {
    3: ["Nice one 😎", "Bravo 🤩", "Great 🙌", "Keep going! 💪"],
    7: ["Impreeessive 🤓", "Sublime 🤝", "Magnifiiicent 🤩"],
    10: ["Leeeegendary ⚡️", "Unbelievaaable 🤯", "Sensational 🐺"],
    20: ["Divine 🌬️"],
  },
}

let last = ""

export function pickComboMessage(streak: number, locale: Locale): string {
  const pool = MESSAGES[locale][streak] ?? []
  if (pool.length === 0) return ""
  const options = pool.length > 1 ? pool.filter((m) => m !== last) : pool
  const choice = options[Math.floor(Math.random() * options.length)]
  last = choice
  return choice
}
