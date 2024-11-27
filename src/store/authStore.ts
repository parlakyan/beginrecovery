import { create } from 'zustand';
import { User } from '../types';
import { usersService } from '../services/firebase';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAuth: () => void;
  initialized: boolean;
  setInitialized: (initialized: boolean) => void;
}

const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  initialized: false,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clearAuth: () => set({ user: null, loading: false, error: null }),
  setInitialized: (initialized) => set({ initialized })
}));

// Get auth instance directly
const auth = getAuth();

// Initialize auth state listener
onAuthStateChanged(auth, async (firebaseUser) => {
  try {
    useAuthStore.getState().setLoading(true);
    
    if (firebaseUser) {
      // Create default user data
      const defaultUser: User = {
        id: firebaseUser.uid,
        email: firebaseUser.email || 'anonymous@user.com',
        role: 'user',
        createdAt: new Date().toISOString()
      };

      try {
        // Try to get user from database
        const user = await usersService.getUserById(firebaseUser.uid);
        if (user) {
          useAuthStore.getState().setUser({
            ...user,
            email: user.email || defaultUser.email
          });
        } else {
          // If no user in database, create one with default data
          const newUser = await usersService.createUser({
            email: defaultUser.email,
            role: defaultUser.role,
            createdAt: defaultUser.createdAt
          });
          useAuthStore.getState().setUser(newUser);
        }
      } catch (error) {
        console.error('Error getting/creating user:', error);
        // Fall back to default user data
        useAuthStore.getState().setUser(defaultUser);
      }
    } else {
      useAuthStore.getState().clearAuth();
    }
  } catch (error) {
    console.error('Error in auth state change:', error);
    useAuthStore.getState().setError('Error initializing auth');
    useAuthStore.getState().clearAuth();
  } finally {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setInitialized(true);
  }
});

export const initializeAuth = async (userId: string) => {
  if (useAuthStore.getState().initialized) return;
  
  try {
    useAuthStore.getState().setLoading(true);
    const user = await usersService.getUserById(userId);
    if (user) {
      useAuthStore.getState().setUser(user);
    }
  } catch (error) {
    console.error('Error initializing auth:', error);
    useAuthStore.getState().setError('Error initializing auth');
    useAuthStore.getState().clearAuth();
  } finally {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setInitialized(true);
  }
};

export default useAuthStore;
