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
      // Get fresh token
      const token = await firebaseUser.getIdToken(true);
      
      // Get user data from API
      const response = await fetch('/.netlify/functions/api/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      console.log('User data fetched:', {
        id: userData.id,
        email: userData.email,
        role: userData.role
      });

      // Combine Firebase user with custom data
      const customUser: CustomUser = {
        ...firebaseUser,
        id: userData.id,
        role: userData.role,
        createdAt: userData.createdAt
      };

      set({ user: customUser, initialized: true, loading: false });
    } catch (error) {
      console.error('Error getting user data:', error);
      // Fallback to basic user data if API call fails
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
      // Force reload user data
      await user.reload();
      // Get fresh token
      const token = await user.getIdToken(true);
      console.log('Token refreshed successfully');
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Sign out if auth error occurs
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

// Set up automatic token refresh every 30 minutes
let refreshInterval: NodeJS.Timeout;

auth.onAuthStateChanged((user) => {
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  if (user) {
    refreshInterval = setInterval(async () => {
      await useAuthStore.getState().refreshToken();
    }, 30 * 60 * 1000); // 30 minutes
  }
});

export default useAuthStore;
