"use client"

import NextLink from "next/link"
import type { ComponentProps } from "react"

import { useLanguage } from "@/lib/i18n/context"
import { localizePath } from "@/lib/i18n/paths"

/**
 * Remplace next/link : en anglais, un lien interne comme « /regles » pointe automatiquement
 * vers « /en/rules ». On écrit donc toujours le chemin français dans le code.
 */
export default function Link({ href, ...props }: ComponentProps<typeof NextLink>) {
  const { locale } = useLanguage()
  const target = typeof href === "string" ? localizePath(href, locale) : href
  return <NextLink href={target} {...props} />
}
