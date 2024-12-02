import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged } from 'firebase/auth';
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
 * Configure Authentication Persistence
 * Uses browserLocalPersistence to maintain auth state across page reloads
 * This allows users to stay logged in until they explicitly sign out
 */
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

/**
 * Initialize Firestore Database
 * Sets up the main database instance used for data storage
 */
const db = getFirestore(app);

/**
 * Authentication State Observer
 * Monitors and logs authentication state changes
 * Also handles automatic token refresh for authenticated users
 * 
 * Logged Information:
 * - Authentication status
 * - User ID
 * - Email
 * - Email verification status
 * - Last login time
 * - Account creation time
 */
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', {
    isAuthenticated: !!user,
    userId: user?.uid,
    email: user?.email,
    emailVerified: user?.emailVerified,
    lastLoginTime: user?.metadata.lastSignInTime,
    creationTime: user?.metadata.creationTime
  });

  // Refresh token for authenticated users
  if (user) {
    user.getIdToken(true).then(token => {
      console.log('Token refreshed:', {
        tokenLength: token.length,
        userId: user.uid
      });
    }).catch(error => {
      console.error('Error refreshing token:', error);
    });
  }
});

// Export initialized Firebase instances
export { app, auth, db, storage };
