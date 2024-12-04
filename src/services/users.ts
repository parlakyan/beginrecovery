import { 
  collection, 
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  updateDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { db } from '../lib/firebase';
import { User, UserStats } from '../types';

const USERS_COLLECTION = 'users';
const FACILITIES_COLLECTION = 'facilities';

/**
 * Transforms Firestore document to User type
 */
const transformUserData = (doc: QueryDocumentSnapshot<DocumentData>): User => {
  const data = doc.data();
  
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString()
    : new Date().toISOString();

  return {
    id: doc.id,
    email: data.email || '',
    role: data.role || 'user',
    createdAt,
    isSuspended: data.isSuspended || false,
    lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null,
    verifiedListings: data.verifiedListings || 0
  };
};

/**
 * Users management service
 */
export const usersService = {
  async getAllUsers() {
    try {
      console.log('Fetching all users');
      const usersRef = collection(db, USERS_COLLECTION);
      
      const q = query(
        usersRef,
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(transformUserData);
      console.log('Fetched users:', users.length);
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      return [];
    }
  },

  async getUserStats(userId: string): Promise<UserStats | null> {
    try {
      console.log('Fetching stats for user:', userId);
      
      // Get user document
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      if (!userDoc.exists()) {
        console.log('No user found with ID:', userId);
        return null;
      }
      
      const userData = userDoc.data();
      
      // Get user's facilities
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(facilitiesRef, where('ownerId', '==', userId));
      const facilitiesSnapshot = await getDocs(q);
      
      // Count total and verified listings
      const totalListings = facilitiesSnapshot.size;
      const verifiedListings = facilitiesSnapshot.docs.filter(doc => doc.data().isVerified).length;
      
      return {
        totalListings,
        verifiedListings,
        lastLogin: userData.lastLogin?.toDate?.()?.toISOString() || '',
        joinDate: userData.createdAt?.toDate?.()?.toISOString() || '',
        status: userData.isSuspended ? 'suspended' : 'active'
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return null;
    }
  },

  async suspendUser(userId: string) {
    try {
      console.log('Suspending user:', userId);
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      await updateDoc(userRef, {
        isSuspended: true,
        updatedAt: serverTimestamp()
      });
      
      // Also suspend all user's facilities
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(facilitiesRef, where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'suspended',
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('Suspended user and their facilities');
    } catch (error) {
      console.error('Error suspending user:', error);
      throw error;
    }
  },

  async unsuspendUser(userId: string) {
    try {
      console.log('Unsuspending user:', userId);
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      await updateDoc(userRef, {
        isSuspended: false,
        updatedAt: serverTimestamp()
      });
      
      // Also reactivate all user's facilities
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(facilitiesRef, where('ownerId', '==', userId));
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(doc => {
        batch.update(doc.ref, {
          status: 'active',
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('Unsuspended user and their facilities');
    } catch (error) {
      console.error('Error unsuspending user:', error);
      throw error;
    }
  },

  async resetUserPassword(email: string) {
    try {
      console.log('Sending password reset email to:', email);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
    } catch (error) {
      console.error('Error sending password reset:', error);
      throw error;
    }
  },

  async getUserFacilities(userId: string) {
    try {
      console.log('Fetching facilities for user:', userId);
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      const q = query(
        facilitiesRef,
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      console.log('Found facilities:', snapshot.size);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user facilities:', error);
      return [];
    }
  },

  async updateLastLogin(userId: string) {
    try {
      console.log('Updating last login for user:', userId);
      const userRef = doc(db, USERS_COLLECTION, userId);
      
      await updateDoc(userRef, {
        lastLogin: serverTimestamp()
      });
      
      console.log('Updated last login');
    } catch (error) {
      console.error('Error updating last login:', error);
      // Don't throw error as this is not critical
    }
  }
};
