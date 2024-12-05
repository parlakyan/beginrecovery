import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  query,
  where,
  serverTimestamp,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../lib/firebase';
import { User, UserStats } from '../types';

export const usersService = {
  async getUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const facilitiesRef = collection(db, 'facilities');
      
      // Get all users
      const usersSnapshot = await getDocs(usersRef);
      
      // Get all facilities
      const facilitiesSnapshot = await getDocs(facilitiesRef);
      
      // Create a map of user IDs to their facility counts
      const facilityCounts = new Map<string, { total: number, verified: number }>();
      facilitiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const ownerId = data.ownerId;
        if (ownerId) {
          const current = facilityCounts.get(ownerId) || { total: 0, verified: 0 };
          current.total++;
          if (data.isVerified) {
            current.verified++;
          }
          facilityCounts.set(ownerId, current);
        }
      });

      // Transform users with facility counts
      return usersSnapshot.docs.map(doc => {
        const data = doc.data();
        const counts = facilityCounts.get(doc.id) || { total: 0, verified: 0 };
        
        // Handle lastLogin timestamp
        let lastLogin = data.lastLogin;
        if (lastLogin instanceof Timestamp) {
          lastLogin = lastLogin.toDate().toISOString();
        } else if (typeof lastLogin === 'string') {
          lastLogin = new Date(lastLogin).toISOString();
        } else {
          lastLogin = null;
        }

        return {
          id: doc.id,
          email: data.email || '',
          name: data.name || '',
          role: data.role || 'user',
          facilities: data.facilities || [],
          verifiedListings: counts.verified,
          totalListings: counts.total,
          isSuspended: data.isSuspended || false,
          lastLogin,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        } as User;
      });
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async updateUser(userId: string, data: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async resetUserPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  },

  async getUserStats(): Promise<UserStats> {
    try {
      const usersRef = collection(db, 'users');
      const facilitiesRef = collection(db, 'facilities');

      // Get all users
      const usersSnapshot = await getDocs(usersRef);
      const totalUsers = usersSnapshot.size;

      // Get new users this month
      const thisMonth = new Date();
      thisMonth.setDate(1); // First day of current month
      const newUsersThisMonth = usersSnapshot.docs.filter(doc => {
        const createdAt = doc.data().createdAt;
        if (createdAt instanceof Timestamp) {
          return createdAt.toDate() >= thisMonth;
        }
        return false;
      }).length;

      // Get active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = usersSnapshot.docs.filter(doc => {
        const lastLogin = doc.data().lastLogin;
        if (lastLogin instanceof Timestamp) {
          return lastLogin.toDate() >= thirtyDaysAgo;
        }
        return false;
      }).length;

      // Get facilities stats
      const facilitiesSnapshot = await getDocs(facilitiesRef);
      const totalListings = facilitiesSnapshot.size;
      const verifiedListings = facilitiesSnapshot.docs.filter(doc => doc.data().isVerified).length;

      // Get most recent login
      const lastLogin = usersSnapshot.docs
        .map(doc => doc.data().lastLogin)
        .filter((login): login is Timestamp => login instanceof Timestamp)
        .sort((a, b) => b.toDate().getTime() - a.toDate().getTime())[0]
        ?.toDate()?.toISOString();

      return {
        totalUsers,
        newUsersThisMonth,
        activeUsers,
        totalListings,
        verifiedListings,
        lastLogin,
        status: 'active'
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalUsers: 0,
        newUsersThisMonth: 0,
        activeUsers: 0,
        totalListings: 0,
        verifiedListings: 0,
        status: 'error'
      };
    }
  },

  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }
};
