import { 
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuthStore } from '../store/authStore';

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    const store = useAuthStore.getState();
    store.setUser(null);
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }
    await firebaseUpdatePassword(user, newPassword);
  } catch (error) {
    console.error('Update password error:', error);
    throw error;
  }
};
