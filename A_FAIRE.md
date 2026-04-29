# Ce que tu dois faire toi-même
Ce projet est prêt en local, mais certaines parties doivent encore être configurées manuellement de ton côté.

## 1. Firebase

1. Ouvre [Firebase Console](https://console.firebase.google.com).
2. Crée un projet, ou utilise-en un existant.
3. Active Firestore Database en mode test.
4. Active Authentication puis la connexion anonyme.
5. Ouvre le fichier `.env.local` à la racine du projet.
6. Remplace toutes les valeurs placeholder par les vraies valeurs Firebase.
7. Redémarre le serveur Vite après modification de `.env.local`.

## 2. Vérifier la synchro

1. Lance l’app avec `npm run dev`.
2. Ajoute un thème et une série.
3. Vérifie que les données existent en local.
4. Une fois Firebase configuré, vérifie aussi Firestore.
5. Si tu vois encore une erreur d’auth, recontrôle les valeurs de `.env.local`.

## 3. Tester le mobile

1. Ouvre l’app sur ton téléphone.
2. Teste "Ajouter à l’écran d’accueil".
3. Vérifie que l’app s’ouvre en plein écran.
4. Teste l’usage hors ligne si besoin.

## 4. Activer les notifications réelles

1. Autorise les notifications dans le navigateur.
2. Renseigne une vraie source de chapitres si tu veux des alertes automatiques.
3. Le bouton Notifications dans l’app sert pour l’instant à tester le support navigateur.

## 5. Comick / source externe

1. Si tu veux l’auto-remplissage, il faut configurer `VITE_COMICK_API_BASE_URL` dans `.env.local`.
2. Si l’API change, il faudra ajuster le service `src/services/comickService.js`.

## 6. Déploiement

1. Choisis Vercel ou Netlify.
2. Connecte le dépôt.
3. Mets la commande de build sur `npm run build`.
4. Publie le dossier `dist`.
5. Ajoute les variables d’environnement Firebase sur la plateforme choisie.

## 7. Migration de l’ancien site

1. Ouvre `old_site.html`.
2. Si nécessaire, récupère les anciennes données avec `migration-script.js`.
3. Recrée ou importe les séries dans la nouvelle app.

## 8. Contrôle rapide final

1. Ajouter une catégorie.
2. Ajouter une série.
3. Modifier une série.
4. Supprimer une série.
5. Tester recherche, filtres, tags et lien source.
6. Tester le bouton Notifications.
7. Tester l’installation PWA.

## Fichiers à modifier toi-même

- `.env.local`
- éventuellement `src/services/comickService.js` si l’API Comick réelle diffère
- éventuellement `src/services/chapterWatchService.js` si tu veux une logique d’alertes plus avancée
- éventuellement les règles Firestore dans Firebase Console
