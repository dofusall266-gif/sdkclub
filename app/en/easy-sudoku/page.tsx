import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("facile", "en")

export default function Page() {
  return <LevelView level="facile" locale="en" />
}
