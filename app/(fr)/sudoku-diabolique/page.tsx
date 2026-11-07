import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("diabolique", "fr")

export default function Page() {
  return <LevelView level="diabolique" locale="fr" />
}
