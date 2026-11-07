import { LevelView, levelMetadata } from "@/components/level-view"

export const metadata = levelMetadata("diabolique", "en")

export default function Page() {
  return <LevelView level="diabolique" locale="en" />
}
