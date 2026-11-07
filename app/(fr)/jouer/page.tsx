import { redirect } from "next/navigation"

// La page d'accueil ("/") est désormais directement le jeu.
// Cette route est conservée uniquement pour rediriger d'anciens liens.
export default async function PlayRedirect({
  searchParams,
}: {
  searchParams: Promise<{ niveau?: string }>
}) {
  const { niveau } = await searchParams
  redirect(niveau ? `/?niveau=${niveau}` : "/")
}
