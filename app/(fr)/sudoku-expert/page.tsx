import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("expert", "fr")

export default function Page() {
  return <LevelView level="expert" locale="fr" />
}
