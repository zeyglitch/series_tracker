# 🚀 Guide de Setup - Manwha Tracker v2

## Phase 1 : Configuration Firebase ⚙️

### Étape 1: Créer un projet Firebase

1. Aller à [Firebase Console](https://console.firebase.google.com)
2. Cliquer sur "Ajouter un projet"
3. Donner un nom: `manwha-tracker`
4. Continuer et créer le projet (attendre 30-60 secondes)

### Étape 2: Configurer Firestore Database

1. Dans Firebase Console, aller dans **Build > Firestore Database**
2. Cliquer sur "Créer une base de données"
3. Sélectionner **Mode de test** (développement)
4. Choisir la région la plus proche (ex: `europe-west1` pour France)
5. Créer la base de données

### Étape 3: Activer Authentication

1. Aller dans **Build > Authentication**
2. Cliquer sur "Commencer"
3. Activer **Connexion anonyme**
4. Sauvegarder

### Étape 4: Récupérer les clés Firebase

1. Aller dans **Project Settings** (gear icon en haut)
2. Aller à l'onglet **Apps**
3. Cliquer sur le logo web `</>`
4. Copier le configuration object:

```javascript
{
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

### Étape 5: Configurer .env.local

1. Ouvrir le fichier `.env.local` à la racine du projet
2. Remplir les champs avec les valeurs récupérées:

```env
VITE_FIREBASE_API_KEY=votre_api_key
VITE_FIREBASE_AUTH_DOMAIN=votre_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_project_id
VITE_FIREBASE_STORAGE_BUCKET=votre_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_id
VITE_FIREBASE_APP_ID=votre_app_id
```

3. Sauvegarder le fichier

## Phase 2: Lancer l'App en Développement 🏃

```bash
cd "c:/projet perso/site web liste manwha"
npm run dev
```

L'app s'ouvre automatiquement à `http://localhost:5173`

## Phase 3: Migrer vos Données 📥

### Option A: Depuis old_site.html

1. Ouvrir `old_site.html` dans votre navigateur
2. Ouvrir la console (F12 ou Cmd+Option+I)
3. Copier/coller le contenu de `migration-script.js`
4. Les données s'affichent → les copier
5. Dans la nouvelle app, utiliser l'import (Feature en phase 3)

### Option B: Ajouter manuellement

La nouvelle app est prête à recevoir de nouvelles séries:

1. Cliquer sur "Ajouter un thème"
2. Sélectionner le type (Manwha/Manga/Anime/Novel)
3. Donner un nom (ex: Romance, Action)
4. Cliquer sur "Ajouter une série"
5. Remplir les infos

## Phase 4: Teste la Synchronisation ☁️

1. Ajouter une série
2. Vérifier dans **Firebase Console > Firestore Database** que les données apparaissent
3. Changer de statut ou incrementer un compteur
4. Vérifier que Firebase est mis à jour en temps réel

## Phase 5: Test Offline 📱

1. Ouvrir DevTools (F12)
2. Aller à l'onglet **Network**
3. Cocher **Offline**
4. Ajouter une série ou changer un compteur
5. Retirer **Offline** et vérifier que les données se synchronisent

## 🎯 Prochaines Étapes (Phase 2+)

- [ ] Tester PWA sur mobile
- [ ] Configurer Comick API (si available)
- [ ] Ajouter notifications
- [ ] Déployer sur Vercel/Netlify
- [ ] Optimiser les performances

## 🆘 Troubleshooting

### Firebase ne connecte pas
```
Erreur: "Missing or insufficient permissions"
```
**Solution**: Vérifier les règles de sécurité Firestore:
1. Firestore Console > Rules
2. Remplacer par:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/series {
      allow read, write: if request.auth != null;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### npm install échoue
```bash
# Effacer cache et essayer à nouveau
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Port 5173 déjà utilisé
```bash
# Utiliser un port différent
npm run dev -- --port 3000
```

## 📖 Documentation Útile

- [Vue.js 3 Docs](https://vuejs.org)
- [Firebase Docs](https://firebase.google.com/docs)
- [Pinia Docs](https://pinia.vuejs.org)
- [Vite Docs](https://vitejs.dev)

---

**Questions ?** Relire le README.md ou le plan dans `/memories/session/plan.md`
