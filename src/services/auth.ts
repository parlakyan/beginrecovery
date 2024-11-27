import { signOut } from 'firebase/auth';
import useAuthStore from '../store/authStore';
import { auth } from '../lib/firebase';

export const handleSignOut = async () => {
  try {
    await signOut(auth);
    useAuthStore.getState().clearAuth();
  } catch (error) {
    console.error('Error signing out:', error);
  }
};
