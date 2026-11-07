import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("fou", "fr")

export default function Page() {
  return <LevelView level="fou" locale="fr" />
}
