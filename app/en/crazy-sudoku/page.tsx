import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("fou", "en")

export default function Page() {
  return <LevelView level="fou" locale="en" />
}
