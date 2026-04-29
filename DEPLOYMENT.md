# Déploiement

Le projet est déjà prêt à être déployé. Les configs suivantes existent déjà:
- `vercel.json`
- `netlify.toml`
- build Vite fonctionnelle
- fallback localStorage
- PWA manifest + service worker

## Déploiement sur Vercel

1. Connecte le dépôt à Vercel.
2. Laisse Vercel détecter Vite.
3. Vérifie que la commande de build est `npm run build`.
4. Vérifie que le dossier de sortie est `dist`.
5. Ajoute les variables d'environnement Firebase dans le dashboard Vercel si tu veux la synchro cloud.
6. Déploie.

## Déploiement sur Netlify

1. Connecte le dépôt à Netlify.
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Ajoute les variables d'environnement Firebase dans Netlify si tu veux la synchro cloud.
5. Déploie.

## Vérifications après déploiement

1. Ouvre l’URL de production.
2. Vérifie le chargement de l’app sur téléphone.
3. Vérifie le bouton de thème.
4. Vérifie l’ajout d’un thème et d’une série.
5. Vérifie le mode hors ligne.
6. Vérifie l’installation PWA.

## Variables d’environnement utiles

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_COMICK_API_BASE_URL`
