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
        return
      }
      // Pas de préférence enregistrée : on propose l'anglais si le navigateur
      // du visiteur est configuré dans une langue non francophone.
      if (!navigator.language.toLowerCase().startsWith("fr")) {
        setLocaleState("en")
      }
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
