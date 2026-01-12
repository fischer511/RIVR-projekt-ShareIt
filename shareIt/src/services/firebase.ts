import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getAuth } from 'firebase/auth';
import AsyncStorage, { AsyncStorageStatic } from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Config values should come from a Firebase Web App (not Android) and be provided via Expo env variables (EXPO_PUBLIC_*)
// Populate these in a .env file at the project root.
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
};

// Basic runtime sanity check to help diagnose invalid-credential issues
if (!firebaseConfig.apiKey || !firebaseConfig.appId || !firebaseConfig.authDomain) {
  console.warn('[Firebase] Missing EXPO_PUBLIC_* env values. Ensure Web App config is set in .env');
}

// Initialize once and reuse the app instance
export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native.
// Guard against re-initialization in fast refresh by falling back to getAuth.
let _auth;
try {
  _auth = initializeAuth(firebaseApp, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch {
  _auth = getAuth(firebaseApp);
}

export const auth = _auth;
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

function getReactNativePersistence(AsyncStorage: AsyncStorageStatic): import("@firebase/auth").Persistence | import("@firebase/auth").Persistence[] | undefined {
    throw new Error('Function not implemented.');
}

