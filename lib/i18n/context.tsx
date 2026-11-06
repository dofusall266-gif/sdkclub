"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { type Dictionary, type Locale, dictionaries } from "@/lib/i18n/dictionaries"

const STORAGE_KEY = "sudokuclub-locale"

interface LanguageContextValue {
  locale: Locale
  t: Dictionary
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("fr")

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === "fr" || saved === "en") {
        setLocaleState(saved)
      }
      // Pas de préférence enregistrée : le français reste la langue par
      // défaut pour tout le monde, sans détection automatique. Le visiteur
      // peut toujours basculer manuellement via le bouton EN/FR.
    } catch {
      // localStorage indisponible : on reste sur le français par défaut.
    }
  }, [])

  const setLocale = (next: Locale) => {
    setLocaleState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }

  return (
    <LanguageContext.Provider value={{ locale, t: dictionaries[locale], setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}
