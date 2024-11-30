import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { usersService } from '../services/firebase';

/**
 * Custom User interface extending Firebase User
 * Adds role and creation date tracking
 */
interface CustomUser extends FirebaseUser {
  id: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

/**
 * Auth Store State & Methods
 * Handles authentication state and user management
 */
interface AuthState {
  user: CustomUser | null;
  initialized: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: FirebaseUser | null) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'user' | 'owner' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  loading: false,
  error: null,

  /**
   * Sets user data and fetches additional info from API
   * Includes role and other custom properties
   */
  setUser: async (firebaseUser) => {
    if (!firebaseUser) {
      set({ user: null, initialized: true, loading: false });
      return;
    }

    try {
      // Get fresh token for API call
      const token = await firebaseUser.getIdToken(true);
      console.log('Getting fresh token for user data fetch');
      
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

      // Create custom user with API data
      const customUser: CustomUser = {
        ...firebaseUser,
        id: userData.id,
        role: userData.role,
        createdAt: userData.createdAt
      };

      set({ user: customUser, initialized: true, loading: false });
    } catch (error) {
      console.error('Error getting user data:', error);
      // Fallback to basic user if API fails
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

  /**
   * Signs in user with email/password
   * Automatically refreshes token and fetches user data
   */
  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Attempting sign in for:', email);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful:', {
        userId: userCredential.user.uid,
        email: userCredential.user.email
      });

      // Force token refresh and user data fetch
      await get().refreshToken();
    } catch (error) {
      console.error('Sign in error:', error);
      const errorMessage = (error as any).code === 'auth/wrong-password' || (error as any).code === 'auth/user-not-found'
        ? 'Invalid email or password'
        : 'An error occurred during sign in';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  /**
   * Creates new user account
   * Sets up user document with role
   */
  signUp: async (email: string, password: string, role: 'user' | 'owner' | 'admin' = 'user') => {
    set({ loading: true, error: null });
    try {
      console.log('Creating account for:', email);
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Firebase user created:', userCredential.user.uid);

      // Create user document
      await usersService.createUser({
        email,
        role,
        createdAt: new Date().toISOString()
      });

      console.log('User document created with role:', role);
      
      // Force token refresh and user data fetch
      await get().refreshToken();
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'An error occurred during registration';
      
      if ((error as any).code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered';
      } else if ((error as any).code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if ((error as any).code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      
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

  /**
   * Refreshes auth token and user data
   * Used to ensure latest role and permissions
   */
  refreshToken: async () => {
    const { user } = get();
    if (!user) {
      console.log('No user found for token refresh');
      return null;
    }

    try {
      console.log('Refreshing auth token and user data');
      // Force reload user data
      await user.reload();
      // Get fresh token
      const token = await user.getIdToken(true);
      // Fetch latest user data
      await get().setUser(user);
      console.log('Token and user data refreshed successfully');
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
