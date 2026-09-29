# 📖 My Series Tracker

Application web personnelle pour suivre ma progression dans mes séries — Manwha, Manga, Anime et Novel.

Projet développé pour répondre à un besoin concret : centraliser le suivi de centaines de séries dans une interface claire, rapide et accessible depuis mon téléphone.

## ✨ Fonctionnalités

- **Organisation par onglets** — Manwha, Manga, Anime, Novel
- **Thèmes personnalisables** — catégories libres par onglet (Romance, Action, Murim…)
- **Suivi de progression** — compteurs de chapitres, saisons, volumes, épisodes
- **Gestion des statuts** — En cours · À lire · Terminé · Abandonné
- **Recherche & filtres** — recherche globale, tri par nom ou dernière modification
- **Tags & notes** — annotations personnelles par série
- **Thème sombre / clair** — toggle avec persistance
- **Export / Import JSON** — sauvegarde et restauration des données
- **Mobile-first** — interface optimisée pour une utilisation sur téléphone

## 🛠 Stack technique

| Technologie | Rôle |
|---|---|
| **Vue 3** | Framework UI (Composition API) |
| **Pinia** | State management |
| **Vite** | Build tool & dev server |
| **Vanilla CSS** | Design system avec custom properties |
| **localStorage** | Persistance des données côté client |

## 💾 Stockage

Les données sont stockées dans le `localStorage` du navigateur — aucun backend, aucune base de données externe. L'application fonctionne entièrement côté client.

L'export JSON permet de sauvegarder et transférer ses données entre appareils.

## 🚀 Lancer le projet

```bash
npm install
npm run dev
```

## 📦 Déploiement

Le projet est configuré pour un déploiement sur **Netlify** (voir `netlify.toml`).

```bash
npm run build   # génère le dossier dist/
```

## 📄 Licence

Projet personnel — usage libre.
