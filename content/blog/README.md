# Ajouter un article de blog

Pas besoin de coder ni de repasser par Claude : il suffit d'ajouter un fichier
`.md` dans `content/blog/fr/`, puis de redéployer le site (un `git push`, ou
un nouveau zip envoyé à votre hébergeur).

## 0. Deux dossiers : `fr/` et `en/`

- `content/blog/fr/` est la version de référence : **tout article doit y
  exister**. C'est cette liste qui détermine les articles publiés sur le
  site, quelle que soit la langue affichée.
- `content/blog/en/` ne contient que les **traductions déjà faites**, avec
  exactement le même nom de fichier que la version française. Si un article
  n'a pas encore de traduction, le site affiche automatiquement la version
  française à la place — rien ne casse, mais pensez à traduire dès que
  possible pour que la version anglaise du site soit cohérente.

## 1. Créez un nouveau fichier

Nommez-le avec des tirets, sans accents ni espaces — ce nom devient l'adresse
de l'article, et doit être **identique** dans `fr/` et `en/`. Exemple :
`pourquoi-jouer-le-soir.md` donnera la page
`sudoku-club.com/blog/pourquoi-jouer-le-soir` (dans les deux langues).

## 2. Collez ce squelette en haut du fichier

```markdown
---
title: "Le titre de votre article"
date: "2026-06-15"
excerpt: "Une ou deux phrases qui résument l'article, affichées dans la liste du blog et dans les résultats Google."
category: "Culture"
faq:
  - q: "Une question que les lecteurs se posent ?"
    a: "La réponse, en une ou deux phrases claires."
  - q: "Une autre question ?"
    a: "Sa réponse."
---

Votre texte commence ici, en Markdown normal.

## Un sous-titre

Un paragraphe. Vous pouvez mettre du texte **en gras**, *en italique*, ou
[un lien](/regles) vers une autre page du site.

- Une liste
- à puces

Une citation :

> Une phrase mise en avant.

| Colonne 1 | Colonne 2 |
| --- | --- |
| Une ligne | ... |
```

- `date` : format `AAAA-MM-JJ`. C'est cette date qui s'affiche en haut de
  l'article et qui détermine l'ordre (le plus récent en premier) sur la page
  `/blog`. Gardez la même date dans `fr/` et `en/` pour un même article.
- `category` : un mot court affiché en badge (« Histoire », « Technique »,
  « Santé », « Culture »... — libre à vous d'en créer d'autres).
- `faq` : optionnel. Une liste de questions/réponses affichées **à part**,
  dans un encadré « Questions fréquentes » en bas de l'article (pas mélangées
  au texte) — bon pour les lecteurs pressés et pour être repris par Google et
  les IA (ChatGPT, Perplexity...).
- Le reste du fichier est du **Markdown standard** : titres avec `#`/`##`,
  gras avec `**...**`, listes avec `-`, liens avec `[texte](/adresse)`,
  tableaux avec `| ... | ... |`.

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
