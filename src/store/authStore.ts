import { create } from 'zustand';
import { User } from '../types';
import { usersService } from '../services/firebase';

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

export const initializeAuth = async (userId: string) => {
  if (useAuthStore.getState().initialized) return;
  
  try {
    useAuthStore.getState().setLoading(true);
    const user = await usersService.getUserById(userId);
    useAuthStore.getState().setUser(user);
  } catch (error) {
    useAuthStore.getState().setError('Error initializing auth');
    console.error('Error initializing auth:', error);
    useAuthStore.getState().clearAuth();
  } finally {
    useAuthStore.getState().setLoading(false);
    useAuthStore.getState().setInitialized(true);
  }
};

export default useAuthStore;
