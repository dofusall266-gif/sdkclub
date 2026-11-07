import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("moyen", "en")

export default function Page() {
  return <LevelView level="moyen" locale="en" />
}
