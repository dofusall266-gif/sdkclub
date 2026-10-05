# Fabrication de la banque de grilles (hors ligne)

Le jeu ne génère plus de grilles dans le navigateur : il pioche dans `lib/puzzle-bank.ts`
(150 grilles par niveau), puis les « déguise » (chiffres, lignes, colonnes, transposition).
Chaque grille de la banque a une solution unique, se résout par pure logique (aucune
devinette) et porte une note de 1 à 100 calculée par `lib/solver.ts`.

Pour régénérer ou agrandir la banque (Node, avec esbuild) :

1. `gen-pool.ts <graine> <secondes> <fichier>` : fabrique un lot de grilles (ajouter `hard`
   en 4e argument pour ne garder que les très difficiles, utile pour le niveau Fou).
2. `build-bank.ts <nb par niveau> <lots...>` : note, vérifie (solution unique, stabilité de
   la note) et écrit `lib/puzzle-bank.ts`.
3. `test-runtime.ts` : contrôle que les grilles déguisées restent valides, logiques et
   bien notées. `test-solver*.ts` : vérifie que le solveur ne se trompe jamais.

Attention : changer la taille de la banque change la grille du défi du jour. Déployer
juste après minuit UTC, et réinitialiser le classement du défi.
