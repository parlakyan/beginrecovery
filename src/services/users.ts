import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  Timestamp,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { User, UserStats } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Input type for user creation
 */
interface CreateUserInput {
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

/**
 * User management service
 */
export const usersService = {
  async createUser(userData: CreateUserInput) {
    if (!auth.currentUser) throw new Error('No authenticated user');
    
    try {
      console.log('Creating new user:', userData);
      const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
      
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        console.log('User already exists, returning existing data');
        return userDoc.data() as User;
      }

      const newUserData: User = {
        id: auth.currentUser.uid,
        email: userData.email,
        role: userData.role,
        createdAt: userData.createdAt
      };

      await setDoc(userRef, newUserData);
      console.log('User created successfully');
      
      return newUserData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users');
      const usersRef = collection(db, USERS_COLLECTION);
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          email: data.email,
          role: data.role,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastLogin: data.lastLogin?.toDate?.()?.toISOString(),
          isSuspended: data.isSuspended || false,
          facilities: data.facilities || [],
          verifiedListings: data.verifiedListings || 0
        } as User;
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async getUserStats(): Promise<UserStats> {
    try {
      console.log('Fetching user statistics');
      const usersRef = collection(db, USERS_COLLECTION);
      const snapshot = await getDocs(usersRef);
      
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      let totalUsers = 0;
      let newUsersThisMonth = 0;
      let activeUsers = 0;
      let lastLogin: string | undefined;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalUsers++;
        
        // Count new users this month
        const createdAt = data.createdAt?.toDate?.();
        if (createdAt && createdAt >= firstDayOfMonth) {
          newUsersThisMonth++;
        }
        
        // Count active users (logged in within last 30 days)
        const userLastLogin = data.lastLogin?.toDate?.();
        if (userLastLogin) {
          const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (userLastLogin >= thirtyDaysAgo) {
            activeUsers++;
          }
          
          // Track most recent login
          if (!lastLogin || userLastLogin > new Date(lastLogin)) {
            lastLogin = userLastLogin.toISOString();
          }
        }
      });
      
      return {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        lastLogin
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {};
    }
  },

  async getUserById(userId: string): Promise<User | null> {
    try {
      console.log('Fetching user by ID:', userId);
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      if (!userDoc.exists()) {
        console.log('No user found with ID:', userId);
        return null;
      }
      
      const data = userDoc.data();
      const user: User = {
        id: userDoc.id,
        email: data.email || 'anonymous@user.com',
        role: data.role || 'user',
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastLogin: data.lastLogin?.toDate?.()?.toISOString(),
        isSuspended: data.isSuspended || false,
        facilities: data.facilities || [],
        verifiedListings: data.verifiedListings || 0
      };
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async updateUser(userId: string, updates: Partial<User>): Promise<boolean> {
    try {
      console.log('Updating user:', { userId, updates });
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      // Convert the updates to Firestore-compatible format
      const firestoreUpdates: DocumentData = { ...updates };
      
      // Handle date conversions
      if (updates.lastLogin) {
        firestoreUpdates.lastLogin = Timestamp.fromDate(new Date(updates.lastLogin));
      }
      if (updates.createdAt) {
        firestoreUpdates.createdAt = Timestamp.fromDate(new Date(updates.createdAt));
      }
      
      await updateDoc(userRef, firestoreUpdates);
      console.log('User updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  },

  async updateUserRole(userId: string, role: 'user' | 'owner' | 'admin'): Promise<boolean> {
    try {
      console.log('Updating user role:', { userId, role });
      const userRef = doc(db, USERS_COLLECTION, userId);
      await updateDoc(userRef, { role });
      console.log('User role updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating user role:', error);
      return false;
    }
  },

  async resetUserPassword(email: string): Promise<void> {
    try {
      console.log('Sending password reset email to:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent successfully');
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw error;
    }
  }
};
