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
      const snapshot = await getDocs(usersRef);
      
      // Get all facilities
      const facilitiesSnapshot = await getDocs(facilitiesRef);
      const facilitiesByOwner = facilitiesSnapshot.docs.reduce((acc, doc) => {
        const data = doc.data();
        const ownerId = data.ownerId;
        if (!acc[ownerId]) {
          acc[ownerId] = {
            total: 0,
            verified: 0
          };
        }
        acc[ownerId].total += 1;
        if (data.isVerified) {
          acc[ownerId].verified += 1;
        }
        return acc;
      }, {} as Record<string, { total: number; verified: number }>);

      return snapshot.docs.map(doc => {
        const facilityStats = facilitiesByOwner[doc.id] || { total: 0, verified: 0 };
        return {
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastLogin: doc.data().lastLogin?.toDate?.()?.toISOString() || null,
          facilities: new Array(facilityStats.total).fill(''), // Array of facility IDs with correct length
          verifiedListings: facilityStats.verified
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

  async getUserFacilities(userId: string): Promise<string[]> {
    try {
      // Query facilities collection for facilities owned by this user
      const facilitiesRef = collection(db, 'facilities');
      const q = query(facilitiesRef, where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting user facilities:', error);
      return [];
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
