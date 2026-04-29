# 📖 Manwha Tracker v2

Une application moderne pour tracker vos séries Manwha, Manga, Anime et Novel avec synchronisation cloud en temps réel.

## ✨ Fonctionnalités

- 📱 **PWA Progressive Web App** - Installable sur mobile/desktop
- ☁️ **Synchronisation Firebase** - Vos données partout où vous êtes
- 🏷️ **Tags Personnalisés** - Organisez vos séries avec des tags
- 🔗 **Liens Source** - Stockez vos liens de lecture/visionnage
- 📊 **Suivi de Progression** - Compteurs doubles (chapitres+episodes, volumes+chapitres)
- 🌙 **Dark Mode Premium** - Design élégant inspiré de Comick.dev
- 📤 **Import/Export** - Sauvegardez et partagez vos listes
- 🔍 **Recherche & Filtres** - Trouvez rapidement vos séries
- 📝 **Notes Personnelles** - Ajoutez vos commentaires
- ⚡ **Offline-First** - Fonctionne même sans connexion Internet grâce au fallback localStorage

## 🚀 Installation & Setup

### 1. Prérequis
- Node.js 16+ et npm/yarn
- Compte Firebase (gratuit sur [firebase.google.com](https://firebase.google.com))

### 2. Installation

```bash
# Cloner ou télécharger le projet
cd "c:/projet perso/site web liste manwha"

# Installer les dépendances
npm install

# Copier le fichier .env
cp .env.example .env.local

# Ajouter vos clés Firebase dans .env.local
```

### 3. Configuration Firebase

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Créer un nouveau projet ou utiliser un existant
3. Activer Firestore Database (mode développement)
4. Activer Firebase Auth (Sign-in anonyme)
5. Copier les clés de configuration
6. Créer le fichier `.env.local` :

```env
VITE_FIREBASE_API_KEY=YOUR_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
VITE_COMICK_API_BASE_URL=https://comick.dev/api
```

### 4. Lancer le développement

```bash
npm run dev
```

L'app s'ouvre à `http://localhost:5173`

## 📦 Build pour la production

```bash
npm run build
```

Les fichiers compilés sont dans `dist/`

## 🌐 Déploiement

### Option 1: Vercel (Recommandé - gratuit)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Option 2: Netlify (gratuit)

1. Aller sur [netlify.com](https://netlify.com)
2. Connecter votre repo GitHub
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Ajouter les variables d'environnement Firebase

### Option 3: Firebase Hosting (gratuit)

```bash
# Installer Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialiser
firebase init hosting

# Déployer
firebase deploy
```

## 📱 Installation comme App Mobile

### iOS (Safari)
1. Ouvrir l'app dans Safari
2. Appuyer sur Partage
3. Ajouter à l'écran d'accueil

### Android (Chrome)
1. Ouvrir l'app dans Chrome
2. Menu ⋮ → Installer l'app
3. Confirmer

## 🛠️ Architecture

```
src/
├── components/        # Composants Vue réutilisables
├── stores/           # Pinia stores (state management)
├── services/         # Firebase, APIs, etc.
├── utils/            # Helpers et constantes
├── App.vue           # Composant root
└── main.js           # Entry point

public/
├── manifest.json     # PWA metadata
└── service-worker.js # Offline support
```

## 📚 Technologies Utilisées

- **Vue.js 3** - Framework frontend
- **Vite** - Build tool ultra-rapide
- **Pinia** - State management
- **Firebase** - Backend serverless
- **CSS Vanilla** - Styling sombre premium
- **PWA** - Progressive Web App

## 🎯 Prochaines Fonctionnalités (v2.5+)

- [ ] API Comick.dev integration (auto-metadata)
- [ ] Notifications chapitre en temps réel
- [ ] Partage public des listes
- [ ] Statistiques & analytics
- [ ] Système d'avis & ratings
- [ ] Backup/restore automatique
- [ ] App mobile React Native (v3)

## 🐛 Problèmes Courants

### Firebase ne se connecte pas
- Vérifier les clés dans `.env.local`
- Vérifier que Firestore est activé
- Vérifier les règles de sécurité Firestore

### PWA n'installe pas
- Vérifier que le manifest.json est correct
- Vérifier le certificat SSL (HTTPS en prod)
- Vérifier que le service-worker est chargé

### Les données ne synchro pas
- Vérifier la connexion Internet
- Ouvrir les DevTools console
- Vérifier les permissions Firebase

## 📄 License

MIT

## 🤝 Support

Questions ou bugs ? Ouvrir une issue GitHub ou contacter le développeur.

---

**Fait avec ❤️ pour les fans de Manwha/Manga/Anime**
