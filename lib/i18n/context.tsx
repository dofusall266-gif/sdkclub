"use client"

import { createContext, useContext } from "react"

import { type Dictionary, type Locale, dictionaries } from "@/lib/i18n/dictionaries"

interface LanguageContextValue {
  locale: Locale
  t: Dictionary
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

/** La langue est fixée par l'adresse de la page : / = français, /en = anglais (voir app/(fr) et app/en). */
export function LanguageProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return <LanguageContext.Provider value={{ locale, t: dictionaries[locale] }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider")
  return ctx
}
