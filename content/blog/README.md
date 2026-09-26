# Ajouter un article de blog

Pas besoin de coder ni de repasser par Claude : il suffit d'ajouter un fichier
`.md` dans ce dossier (`content/blog/`), puis de redéployer le site (un
`git push`, ou un nouveau zip envoyé à votre hébergeur).

## 1. Créez un nouveau fichier

Nommez-le avec des tirets, sans accents ni espaces — ce nom devient l'adresse
de l'article. Exemple : `pourquoi-jouer-le-soir.md` donnera la page
`sudoku-club.com/blog/pourquoi-jouer-le-soir`.

## 2. Collez ce squelette en haut du fichier

```markdown
---
title: "Le titre de votre article"
date: "2026-06-15"
excerpt: "Une ou deux phrases qui résument l'article, affichées dans la liste du blog et dans les résultats Google."
category: "Culture"
---

Votre texte commence ici, en Markdown normal.

## Un sous-titre

Un paragraphe. Vous pouvez mettre du texte **en gras**, *en italique*, ou
[un lien](/regles) vers une autre page du site.

- Une liste
- à puces

Une citation :

> Une phrase mise en avant.
```

- `date` : format `AAAA-MM-JJ`. C'est cette date qui s'affiche en haut de
  l'article et qui détermine l'ordre (le plus récent en premier) sur la page
  `/blog`.
- `category` : un mot court affiché en badge (« Histoire », « Technique »,
  « Santé », « Culture »... — libre à vous d'en créer d'autres).
- Le reste du fichier est du **Markdown standard** : titres avec `#`/`##`,
  gras avec `**...**`, listes avec `-`, liens avec `[texte](/adresse)`.

## 3. Ajouter une image (facultatif)

Déposez votre image dans `public/blog/images/`, puis référencez-la dans
l'article avec :

```markdown
![Description de l'image](/blog/images/mon-image.jpg)
```

Utilisez uniquement des images dont vous avez les droits (vos propres photos,
des illustrations achetées/libres de droits) — jamais une image trouvée sur
Google Images sans vérifier sa licence.

## 4. Aperçu avant publication

En local, lancez le site (`npm run dev`) et ouvrez `/blog` : votre article doit
apparaître automatiquement dans la liste, sans rien configurer d'autre.
