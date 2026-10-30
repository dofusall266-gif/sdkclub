# Fabrication de la banque de grilles (hors ligne)

Le jeu ne génère plus de grilles dans le navigateur : il pioche dans `lib/puzzle-bank.ts`
(plusieurs centaines de grilles par niveau), puis les « déguise » (chiffres, lignes, colonnes,
transposition). Chaque grille de la banque a une solution unique, se résout par pure logique
(aucune devinette) et porte une note de 1 à 100 calculée par `lib/solver.ts`.

## Principe des grilles « naturelles » (depuis la V17.1)

Chaque niveau a un nombre d'indices de départ cible et une boîte à outils de techniques
(voir `LEVEL_PARAMS` dans `gen-level.ts`) :

| Niveau | Indices | Techniques | Particularités |
|---|---|---|---|
| Facile | 38-46 | chiffres uniques | symétrique, 3 indices min. par bloc |
| Moyen | 32-38 | + alignements, paires | symétrique, 2 min. par bloc |
| Difficile | 26-32 | + triplets | symétrique, 2 min. par bloc |
| Expert | 25-28 | + X-Wing, Y-Wing, Swordfish… | symétrique |
| Diabolique | 24-27 | + chaînes | |
| Fou | 22-26 | tout | |

Les indices sont retirés par paires symétriques (rotation de 180°) et on s'arrête à la cible
au lieu d'aller jusqu'au minimum : les départs sont plus généreux et le niveau se sent dans la
difficulté du raisonnement, pas dans le vide de la grille.

## Fabriquer ou agrandir la banque (Node + esbuild)

1. `gen-level.ts <niveau> <graine> <secondes> <fichier>` : fabrique des grilles pour un niveau
   (elles doivent tomber dans la tranche de notes du niveau, voir `LEVEL_RANGES`).
2. `build-bank.ts <nb par niveau> niveau=fichier ...` : revérifie (solution unique, stabilité
   de la note après déguisement) et écrit `lib/puzzle-bank.ts`.
3. `test-runtime.ts` : contrôle que les grilles déguisées restent valides, logiques et bien
   notées. `test-solver*.ts` : vérifie que le solveur ne se trompe jamais.

Attention : changer la banque change la grille du défi du jour. Déployer juste après minuit UTC,
et réinitialiser le classement du défi.
