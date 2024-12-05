import { create } from 'zustand';
import { 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { User } from '../types';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const transformUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Force token refresh to get latest custom claims
  const token = await firebaseUser.getIdTokenResult(true);
  
  // Default to 'user' role if no role claim is present
  const role = (token.claims.role as 'user' | 'admin' | 'owner') || 'user';
  
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    role,
    createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    updatedAt: firebaseUser.metadata.lastSignInTime || new Date().toISOString(),
    lastLogin: firebaseUser.metadata.lastSignInTime || new Date().toISOString()
  };
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = await transformUser(userCredential.user);
      set({ user, loading: false });
    } catch (error) {
      console.error('Sign in error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign in', 
        loading: false 
      });
    }
  },

  signOut: async () => {
    try {
      set({ loading: true, error: null });
      await firebaseSignOut(auth);
      set({ user: null, loading: false });
    } catch (error) {
      console.error('Sign out error:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to sign out', 
        loading: false 
      });
    }
  },

  refreshToken: async () => {
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const user = await transformUser(currentUser);
        set({ user });
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  }
}));

// Set up auth state listener
onAuthStateChanged(auth, async (firebaseUser) => {
  if (firebaseUser) {
    try {
      const user = await transformUser(firebaseUser);
      useAuthStore.setState({ user, loading: false });
    } catch (error) {
      console.error('Auth state change error:', error);
      useAuthStore.setState({ 
        error: error instanceof Error ? error.message : 'Authentication error',
        loading: false 
      });
    }
  } else {
    useAuthStore.setState({ user: null, loading: false });
  }
});
