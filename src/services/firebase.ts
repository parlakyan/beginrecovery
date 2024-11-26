import { 
  collection, 
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  limit,
  DocumentData,
  QueryDocumentSnapshot,
  enableNetwork,
  disableNetwork,
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Facility } from '../types';

const FACILITIES_COLLECTION = 'facilities';
const USERS_COLLECTION = 'users';

export const networkService = {
  goOnline: async () => {
    try {
      await enableNetwork(db);
    } catch (error) {
      console.error('Error enabling network:', error);
    }
  },
  
  goOffline: async () => {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.error('Error disabling network:', error);
    }
  }
};

const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    images: data.images || [],
    amenities: data.amenities || [],
    tags: data.tags || [],
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
  };
};

export const facilitiesService = {
  async getFacilities() {
    try {
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(q);
      const facilities = snapshot.docs.map(transformFacilityData) as Facility[];

      return { facilities };
    } catch (error) {
      console.error('Error getting facilities:', error);
      return { facilities: [] };
    }
  },

  async getFacilityById(id: string) {
    try {
      const docRef = doc(db, FACILITIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return null;
      }
      
      return transformFacilityData(docSnap) as Facility;
    } catch (error) {
      console.error('Error getting facility:', error);
      return null;
    }
  },

  async createFacility(data: Partial<Facility>) {
    if (!auth.currentUser) throw new Error('User must be authenticated');

    try {
      const facilityData = {
        ...data,
        ownerId: auth.currentUser.uid,
        status: 'pending',
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, FACILITIES_COLLECTION), facilityData);
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  },

  async getUserListings(userId: string) {
    try {
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(transformFacilityData) as Facility[];
    } catch (error) {
      console.error('Error getting user listings:', error);
      return [];
    }
  }
};

export const usersService = {
  async createUser(userData: { email: string; role: string }) {
    if (!auth.currentUser) throw new Error('No authenticated user');
    
    try {
      const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
      const batch = writeBatch(db);
      
      batch.set(userRef, {
        ...userData,
        id: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUserById(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      return {
        ...data,
        id: userDoc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
};