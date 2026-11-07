import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("expert", "en")

export default function Page() {
  return <LevelView level="expert" locale="en" />
}
