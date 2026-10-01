import type { MetadataRoute } from "next"

// Manifeste PWA : c'est lui qui permet d'« installer » le site comme une app
// (icône sur l'écran d'accueil, ouverture en plein écran, sans barre du navigateur).
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Sudoku Club",
    short_name: "SudokuClub",
    description: "Free online Sudoku · Sudoku gratuit en ligne — grilles uniques, 4 niveaux, défi du jour.",
    start_url: "/jouer",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#1E140F",
    theme_color: "#1E140F",
    lang: "fr",
    categories: ["games", "puzzle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Défi du jour", short_name: "Défi", url: "/defi", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Nouvelle grille", short_name: "Jouer", url: "/jouer", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  }
}
