import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("moyen", "fr")

export default function Page() {
  return <LevelView level="moyen" locale="fr" />
}
