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
  addDoc,
  updateDoc,
  deleteDoc,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Facility } from '../types';

const FACILITIES_COLLECTION = 'facilities';
const USERS_COLLECTION = 'users';
const FACILITIES_PER_PAGE = 12;

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

const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
  console.log('Raw facility data:', { id: doc.id, ...data });
  
  return {
    id: doc.id,
    name: data.name || '',
    description: data.description || '',
    location: data.location || '',
    amenities: data.amenities || [],
    images: data.images || [],
    status: data.status || 'pending',
    ownerId: data.ownerId || '',
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    subscriptionId: data.subscriptionId,
    phone: data.phone || '',
    tags: data.tags || [],
    isVerified: Boolean(data.subscriptionId),
    moderationStatus: data.moderationStatus || 'pending'
  };
};

export const facilitiesService = {
  async getFacilities(lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    try {
      console.log('Fetching facilities from collection:', FACILITIES_COLLECTION);
      
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      let q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(FACILITIES_PER_PAGE)
      );

      if (lastDoc) {
        q = query(
          facilitiesRef,
          where('moderationStatus', '==', 'approved'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(FACILITIES_PER_PAGE)
        );
      }
      
      console.log('Executing facilities query...');
      const snapshot = await getDocs(q);
      console.log('Query returned:', snapshot.size, 'facilities');
      
      const facilities = snapshot.docs.map(doc => {
        const facility = transformFacilityData(doc);
        console.log('Transformed facility:', facility);
        return facility;
      });

      const lastVisible = snapshot.docs[snapshot.docs.length - 1];
      const hasMore = snapshot.docs.length === FACILITIES_PER_PAGE;

      return { facilities, lastVisible, hasMore };
    } catch (error) {
      console.error('Error getting facilities:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return { facilities: [], lastVisible: null, hasMore: false };
    }
  },

  async getFacilityById(id: string) {
    try {
      console.log('Fetching facility by ID:', id);
      const docRef = doc(db, FACILITIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('No facility found with ID:', id);
        return null;
      }
      
      const facility = transformFacilityData(docSnap);
      console.log('Found facility:', facility);
      return facility;
    } catch (error) {
      console.error('Error getting facility:', error);
      return null;
    }
  },

  async createFacility(data: Partial<Facility>) {
    if (!auth.currentUser) throw new Error('User must be authenticated');

    try {
      console.log('Creating new facility with data:', data);
      const facilityData = {
        ...data,
        ownerId: auth.currentUser.uid,
        status: 'pending',
        rating: 0,
        reviewCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        moderationStatus: 'pending',
        isVerified: false
      };

      const docRef = await addDoc(collection(db, FACILITIES_COLLECTION), facilityData);
      console.log('Created facility with ID:', docRef.id);
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  },

  async updateFacility(id: string, data: Partial<Facility>) {
    try {
      console.log('Updating facility:', id, 'with data:', data);
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(facilityRef, updateData);
      console.log('Facility updated successfully');
      
      return true;
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  },

  async approveFacility(id: string) {
    try {
      console.log('Approving facility:', id);
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      
      await updateDoc(facilityRef, {
        moderationStatus: 'approved',
        updatedAt: serverTimestamp()
      });

      console.log('Facility approved successfully');
      return true;
    } catch (error) {
      console.error('Error approving facility:', error);
      throw error;
    }
  },

  async rejectFacility(id: string) {
    try {
      console.log('Rejecting facility:', id);
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      
      await updateDoc(facilityRef, {
        moderationStatus: 'rejected',
        updatedAt: serverTimestamp()
      });

      console.log('Facility rejected successfully');
      return true;
    } catch (error) {
      console.error('Error rejecting facility:', error);
      throw error;
    }
  },

  async archiveFacility(id: string) {
    try {
      console.log('Archiving facility:', id);
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      
      await updateDoc(facilityRef, {
        moderationStatus: 'archived',
        updatedAt: serverTimestamp()
      });

      console.log('Facility archived successfully');
      return true;
    } catch (error) {
      console.error('Error archiving facility:', error);
      throw error;
    }
  },

  async deleteFacility(id: string) {
    try {
      console.log('Deleting facility:', id);
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      
      await deleteDoc(facilityRef);
      console.log('Facility deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  },

  async getUserListings(userId: string) {
    try {
      console.log('Fetching listings for user:', userId);
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'listings for user');
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting user listings:', error);
      return [];
    }
  },

  async getAllListingsForAdmin() {
    try {
      console.log('Fetching all listings for admin');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('moderationStatus', '!=', 'archived'),
        orderBy('moderationStatus'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'total listings');
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting all listings:', error);
      return [];
    }
  },

  async getArchivedListings() {
    try {
      console.log('Fetching archived listings');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'archived'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'archived listings');
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting archived listings:', error);
      return [];
    }
  }
};

export const usersService = {
  async createUser(userData: { email: string; role: string }) {
    if (!auth.currentUser) throw new Error('No authenticated user');
    
    try {
      console.log('Creating new user:', userData);
      const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
      const batch = writeBatch(db);
      
      batch.set(userRef, {
        ...userData,
        id: auth.currentUser.uid,
        createdAt: serverTimestamp()
      });

      await batch.commit();
      console.log('User created successfully');
      return userData;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  async getUserById(userId: string) {
    try {
      console.log('Fetching user by ID:', userId);
      const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
      if (!userDoc.exists()) {
        console.log('No user found with ID:', userId);
        return null;
      }
      
      const data = userDoc.data();
      const user = {
        ...data,
        id: userDoc.id,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      };
      console.log('Found user:', user);
      return user;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
};
