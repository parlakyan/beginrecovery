import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = getAuth(app);

// Set persistence to LOCAL
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Firebase Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

// Initialize Firestore
const db = getFirestore(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
    console.log('Connected to Firebase emulators');
  } catch (error) {
    console.error('Error connecting to emulators:', error);
  }
}

// Log auth state changes
onAuthStateChanged(auth, (user) => {
  console.log('Auth state changed:', {
    isAuthenticated: !!user,
    userId: user?.uid,
    email: user?.email,
    emailVerified: user?.emailVerified,
    lastLoginTime: user?.metadata.lastSignInTime,
    creationTime: user?.metadata.creationTime
  });

  // If user is logged in, set up token refresh
  if (user) {
    // Get current token
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

export { app, auth, db };
