import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

/**
 * Firebase Configuration
 * 
 * Required Environment Variables:
 * - VITE_FIREBASE_API_KEY: Project API key
 * - VITE_FIREBASE_AUTH_DOMAIN: Auth domain for sign-in
 * - VITE_FIREBASE_STORAGE_BUCKET: Storage bucket URL
 * - VITE_FIREBASE_MESSAGING_SENDER_ID: Cloud Messaging sender ID
 * - VITE_FIREBASE_APP_ID: Application ID
 * - VITE_FIREBASE_MEASUREMENT_ID: Analytics measurement ID
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: 'beginrecovery-bb288', // Hardcoded since it's public and matches service account
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Log config for debugging (without sensitive values)
console.log('Firebase Config:', {
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  hasAppId: !!firebaseConfig.appId
});

/**
 * Initialize Firebase Application
 * Creates the main Firebase app instance used throughout the application
 */
const app = initializeApp(firebaseConfig);

/**
 * Initialize Firebase Authentication
 * Sets up auth instance with local persistence for session management
 */
const auth = getAuth(app);

/**
 * Initialize Firebase Storage
 * Sets up storage instance for handling file uploads
 */
const storage = getStorage(app);

/**
 * Initialize Firestore Database
 * Sets up the main database instance used for data storage
 */
const db = getFirestore(app);

/**
 * Configure Authentication Persistence
 * Uses browserLocalPersistence to maintain auth state across page reloads
 * This allows users to stay logged in until they explicitly sign out
 * 
 * Note: This must be called before any other auth operations
 */
(async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Firebase Auth persistence set to LOCAL');
  } catch (error) {
    console.error('Error setting auth persistence:', error);
    // Still allow the app to function, just with reduced persistence
  }
})();

// Export initialized Firebase instances
export { app, auth, db, storage };
