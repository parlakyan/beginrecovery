import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  AuthError,
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { usersService } from '../services/firebase';

interface User {
  id: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin';
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role?: 'user' | 'owner') => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

const formatAuthError = (error: AuthError): string => {
  switch (error.code) {
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Invalid email or password';
    default:
      return error.message || 'An error occurred during authentication';
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      error: null,
      initialized: false,

      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setInitialized: (initialized) => set({ initialized }),

      signIn: async (email: string, password: string) => {
        try {
          set({ loading: true, error: null });
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const userData = await usersService.getUserById(userCredential.user.uid);
          set({ user: userData });
        } catch (error: any) {
          const errorMessage = formatAuthError(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signUp: async (email: string, password: string, role: 'user' | 'owner' = 'user') => {
        try {
          set({ loading: true, error: null });
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          
          await usersService.createUser({
            email,
            role
          });

          set({ 
            user: {
              id: userCredential.user.uid,
              email: userCredential.user.email,
              role
            }
          });
        } catch (error: any) {
          const errorMessage = formatAuthError(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      signOut: async () => {
        try {
          await firebaseSignOut(auth);
          set({ user: null });
        } catch (error: any) {
          set({ error: 'Failed to sign out' });
          throw error;
        }
      },

      resetPassword: async (email: string) => {
        try {
          set({ loading: true, error: null });
          await sendPasswordResetEmail(auth, email);
        } catch (error: any) {
          const errorMessage = formatAuthError(error);
          set({ error: errorMessage });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);

// Set up auth state listener
onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
  const store = useAuthStore.getState();

  try {
    store.setLoading(true);

    if (firebaseUser) {
      const userData = await usersService.getUserById(firebaseUser.uid);
      store.setUser(userData);
    } else {
      store.setUser(null);
    }
  } catch (error) {
    console.error('Auth state change error:', error);
    store.setUser(null);
  } finally {
    store.setLoading(false);
    store.setInitialized(true);
  }
});