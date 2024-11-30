import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { signInWithEmailAndPassword, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';

// Extend Firebase User type with our custom properties
interface CustomUser extends FirebaseUser {
  id: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

interface AuthState {
  user: CustomUser | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: FirebaseUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  setUser: async (firebaseUser) => {
    if (!firebaseUser) {
      set({ user: null, initialized: true, loading: false });
      return;
    }

    try {
      // Get additional user data from Firestore
      const userDoc = await fetch('/.netlify/functions/api/user', {
        headers: {
          'Authorization': `Bearer ${await firebaseUser.getIdToken()}`
        }
      }).then(res => res.json());

      // Combine Firebase user with custom data
      const customUser: CustomUser = {
        ...firebaseUser,
        id: firebaseUser.uid,
        role: userDoc.role || 'user',
        createdAt: userDoc.createdAt || new Date().toISOString()
      };

      set({ user: customUser, initialized: true, loading: false });
      
      // Log auth state for debugging
      console.log('Auth store updated:', {
        isAuthenticated: true,
        userId: customUser.id,
        email: customUser.email,
        emailVerified: customUser.emailVerified,
        role: customUser.role
      });
    } catch (error) {
      console.error('Error getting user data:', error);
      set({ 
        user: {
          ...firebaseUser,
          id: firebaseUser.uid,
          role: 'user',
          createdAt: new Date().toISOString()
        } as CustomUser,
        initialized: true,
        loading: false
      });
    }
  },

  setError: (error) => {
    set({ error, loading: false });
    if (error) {
      console.error('Auth store error:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Attempting sign in for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', {
        userId: userCredential.user.uid,
        email: userCredential.user.email
      });
      // setUser will be called by the auth state listener
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = (error as any).code === 'auth/wrong-password' || (error as any).code === 'auth/user-not-found'
        ? 'Invalid email or password'
        : 'An error occurred during sign in';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ 
        error: 'An error occurred during sign out',
        loading: false 
      });
      throw error;
    }
  },

  refreshToken: async () => {
    const { user } = get();
    if (!user) {
      console.log('No user found for token refresh');
      return null;
    }

    try {
      console.log('Refreshing auth token');
      // Force reload the user to get fresh data
      await user.reload();
      // Get a fresh token
      const token = await user.getIdToken(true);
      console.log('Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // If there's an auth error, sign out the user
      if ((error as any).code?.startsWith('auth/')) {
        await firebaseSignOut(auth);
        set({ user: null, error: 'Authentication expired. Please sign in again.' });
      }
      return null;
    }
  }
}));

// Set up auth state listener
auth.onAuthStateChanged(
  (user) => {
    console.log('Firebase auth state changed:', {
      isAuthenticated: !!user,
      userId: user?.uid,
      email: user?.email
    });
    useAuthStore.getState().setUser(user);
  },
  (error) => {
    console.error('Firebase auth error:', error);
    useAuthStore.getState().setError(error.message);
  }
);

// Set up token refresh
let refreshInterval: NodeJS.Timeout;

auth.onAuthStateChanged((user) => {
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  if (user) {
    // Refresh token every 30 minutes
    refreshInterval = setInterval(async () => {
      await useAuthStore.getState().refreshToken();
    }, 30 * 60 * 1000); // 30 minutes
  }
});

export default useAuthStore;
