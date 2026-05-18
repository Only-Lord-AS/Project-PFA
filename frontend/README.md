# Frontend Demo - PFA E-commerce

Ce dossier contient une interface **Next.js + Tailwind CSS** uniquement frontend (mode demo), sans logique backend additionnelle.

## Pages incluses

- Accueil
- Catalogue (recherche + filtre + ajout demo)
- Panier (quantites + resume commande)
- Recommandations (filtrage par categorie)
- Inscription (formulaire pret a brancher)

## Lancement

1. Installer Node.js avec `npm` disponible dans le PATH.
2. Dans ce dossier, lancer:

```bash
npm install
npm run dev
```

3. Ouvrir [http://localhost:3000](http://localhost:3000)

## Transition Backend

- Le point d'extension est `src/lib/api-client.ts`.
- Les composants UI restent stables; il suffit de remplacer le mock par des appels API (JWT/IDS existants).
