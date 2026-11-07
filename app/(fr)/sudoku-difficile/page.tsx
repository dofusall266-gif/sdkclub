import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("difficile", "fr")

export default function Page() {
  return <LevelView level="difficile" locale="fr" />
}
