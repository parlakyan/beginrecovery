import { create } from 'zustand';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  User as FirebaseUser,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { usersService } from '../services/users';

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
  setUser: (user: FirebaseUser | null) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'user' | 'owner' | 'admin') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, token?: string, newPassword?: string) => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

// Set persistence to local
setPersistence(auth, browserLocalPersistence).catch(console.error);

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
      // Get token without force refresh first
      const token = await firebaseUser.getIdToken(false);
      console.log('Getting user data with current token');
      
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

      // Double-check admin status
      if (firebaseUser.email === 'admin@beginrecovery.com' && customUser.role !== 'admin') {
        console.log('Forcing admin role for admin email');
        customUser.role = 'admin';
        // Update role in database
        await usersService.createUser({
          email: firebaseUser.email,
          role: 'admin',
          createdAt: userData.createdAt || new Date().toISOString()
        });
      }

      // Only update state if user is still logged in
      if (auth.currentUser?.uid === firebaseUser.uid) {
        set({ user: customUser, initialized: true, loading: false });
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      // Only set fallback if user is still logged in
      if (auth.currentUser?.uid === firebaseUser.uid) {
        const fallbackUser = {
          ...firebaseUser,
          id: firebaseUser.uid,
          role: firebaseUser.email === 'admin@beginrecovery.com' ? 'admin' : 'user',
          createdAt: new Date().toISOString()
        } as CustomUser;

        set({ 
          user: fallbackUser,
          initialized: true,
          loading: false
        });
      }
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

      // Get fresh token without force refresh
      await userCredential.user.getIdToken(false);
      
      // Force another sign in if admin to ensure claims are set
      if (email === 'admin@beginrecovery.com') {
        await firebaseSignOut(auth);
        await signInWithEmailAndPassword(auth, email, password);
      }
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
        role: email === 'admin@beginrecovery.com' ? 'admin' : role,
        createdAt: new Date().toISOString()
      });

      console.log('User document created with role:', role);
      
      // Get token without force refresh
      await userCredential.user.getIdToken(false);
      
      // Force another sign in if admin to ensure claims are set
      if (email === 'admin@beginrecovery.com') {
        await firebaseSignOut(auth);
        await signInWithEmailAndPassword(auth, email, password);
      }
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

  /**
   * Signs out current user
   */
  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseSignOut(auth);
      set({ user: null, loading: false });
      // Clear any cached data
      sessionStorage.clear();
      localStorage.clear();
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
   * Handles password reset flow
   * If only email provided, sends reset email
   * If token and new password provided, confirms reset
   */
  resetPassword: async (email: string, token?: string, newPassword?: string) => {
    set({ loading: true, error: null });
    try {
      if (token && newPassword) {
        // Confirm password reset
        await confirmPasswordReset(auth, token, newPassword);
        console.log('Password reset confirmed');
      } else {
        // Send reset email
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent');
      }
      set({ loading: false });
    } catch (error) {
      console.error('Password reset error:', error);
      let errorMessage = 'An error occurred during password reset';
      
      if ((error as any).code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if ((error as any).code === 'auth/invalid-action-code') {
        errorMessage = 'Invalid or expired reset link';
      }
      
      set({ error: errorMessage, loading: false });
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
      // Force token refresh
      const token = await user.getIdToken(true);
      // Fetch latest user data
      await get().setUser(auth.currentUser);
      return token;
    } catch (error) {
      console.warn('Token refresh warning:', error);
      return null;
    }
  }
}));

// Set up auth state listener
let authStateInitialized = false;

auth.onAuthStateChanged(
  async (user) => {
    console.log('Firebase auth state changed:', {
      isAuthenticated: !!user,
      userId: user?.uid,
      email: user?.email,
      isInitialLoad: !authStateInitialized
    });

    // Skip initial load if we already have a user
    if (!authStateInitialized && useAuthStore.getState().user) {
      authStateInitialized = true;
      return;
    }

    authStateInitialized = true;
    await useAuthStore.getState().setUser(user);
  },
  (error) => {
    console.error('Firebase auth error:', error);
    useAuthStore.getState().setError(error.message);
  }
);

// Set up automatic token refresh every 45 minutes
let refreshInterval: NodeJS.Timeout;

auth.onAuthStateChanged((user) => {
  // Clear existing interval
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }

  if (user) {
    refreshInterval = setInterval(async () => {
      try {
        await useAuthStore.getState().refreshToken();
      } catch (error) {
        console.warn('Background token refresh warning:', error);
      }
    }, 45 * 60 * 1000); // 45 minutes
  }
});

export default useAuthStore;
