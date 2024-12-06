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
  createdAt: string;
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
          
          const newUser = await usersService.createUser({
            email,
            role,
            createdAt: new Date().toISOString()
          });

          set({ user: newUser });
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
    console.log('Auth state changed:', firebaseUser ? firebaseUser.uid : 'No user');

    if (firebaseUser) {
      try {
        console.log('Fetching user data for:', firebaseUser.uid);
        const userData = await usersService.getUserById(firebaseUser.uid);
        
        if (userData) {
          console.log('User data found:', userData);
          store.setUser(userData);
        } else {
          console.log('No user data found, creating new user');
          const newUser = await usersService.createUser({
            email: firebaseUser.email || '',
            role: 'user',
            createdAt: new Date().toISOString()
          });
          
          console.log('New user created:', newUser);
          store.setUser(newUser);
        }
      } catch (userFetchError) {
        console.error('Error fetching/creating user data:', userFetchError);
        store.setUser(null);
      }
    } else {
      console.log('No authenticated user');
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
