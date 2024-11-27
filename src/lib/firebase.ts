import { initializeApp } from 'firebase/app';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager,
  type PersistentSingleTabManagerSettings
} from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';
import useAuthStore from '../store/authStore';
import { usersService } from '../services/firebase';

// Initialize Firebase with environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth first
const auth = getAuth(app);

// Initialize Firestore with modern persistence settings
const settings: PersistentSingleTabManagerSettings = {};

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager(settings)
  })
});

// Set auth persistence and initialize auth state listener
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    // Set up auth state listener
    onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const user = await usersService.getUserById(firebaseUser.uid);
          useAuthStore.getState().setUser(user);
        } else {
          useAuthStore.getState().clearAuth();
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        useAuthStore.getState().setError('Error initializing auth');
        useAuthStore.getState().clearAuth();
      } finally {
        useAuthStore.getState().setLoading(false);
      }
    });
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
    useAuthStore.getState().setError('Error initializing auth');
    useAuthStore.getState().setLoading(false);
  });

// Initialize analytics only in production
const analytics = async () => {
  if (await isSupported() && import.meta.env.PROD) {
    return getAnalytics(app);
  }
  return null;
};

export { db, auth, analytics };
export default app;
