import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("difficile", "en")

export default function Page() {
  return <LevelView level="difficile" locale="en" />
}
