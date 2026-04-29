import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore'
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth'

const isConfiguredValue = (value) => {
  if (!value) return false
  const trimmed = String(value).trim()
  if (!trimmed) return false

  return !/^your-|^YOUR_|^votre_/i.test(trimmed)
}

const hasFirebaseConfig = Boolean(
  isConfiguredValue(import.meta.env.VITE_FIREBASE_API_KEY) &&
  isConfiguredValue(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) &&
  isConfiguredValue(import.meta.env.VITE_FIREBASE_PROJECT_ID) &&
  isConfiguredValue(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) &&
  isConfiguredValue(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) &&
  isConfiguredValue(import.meta.env.VITE_FIREBASE_APP_ID)
)

const firebaseConfig = hasFirebaseConfig
  ? {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    }
  : null

const app = firebaseConfig ? initializeApp(firebaseConfig) : null
const db = app ? getFirestore(app) : null
const auth = app ? getAuth(app) : null

// État d'authentification
let currentUser = null
let isInitialized = false

// Initialiser l'authentification
const initAuth = async () => {
  if (!auth) {
    return null
  }

  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user
      if (!isInitialized && !user) {
        // Authentification anonyme si l'utilisateur n'est pas connecté
        signInAnonymously(auth).catch(err => console.error('Auth error:', err))
      }
      isInitialized = true
      resolve(user)
    })
  })
}

// Initialiser l'authentification au démarrage
if (auth) {
  initAuth()
}

export const firebaseService = {
  // Charger les données utilisateur
  async loadUserData() {
    try {
      if (!db || !auth) return null

      const user = await initAuth()
      if (!user) return null

      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        return userDocSnap.data()
      } else {
        // Créer document utilisateur s'il n'existe pas
        return {
          manwha: [],
          manga: [],
          anime: [],
          novel: [],
          createdAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Erreur loadUserData:', error)
      throw error
    }
  },

  // Sauvegarder les données utilisateur
  async saveUserData(data) {
    try {
      if (!db || !auth) {
        throw new Error('Firebase non configuré')
      }

      const user = await initAuth()
      if (!user) throw new Error('Utilisateur non authentifié')

      const userDocRef = doc(db, 'users', user.uid)
      await setDoc(userDocRef, {
        ...data,
        lastUpdated: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erreur saveUserData:', error)
      throw error
    }
  },

  // Écouter les changements en temps réel
  onUserDataChanged(callback) {
    if (!db || !auth) return () => {}

    onAuthStateChanged(auth, (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid)
        return onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            callback(doc.data())
          }
        }, (error) => {
          console.error('Erreur listener:', error)
        })
      }
    })
  },

  // Récupérer l'utilisateur courant
  getCurrentUser() {
    return currentUser
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return !!currentUser
  },

  // Vérifier si Firebase est configuré
  isConfigured() {
    return hasFirebaseConfig
  }
}

export { auth, db }
