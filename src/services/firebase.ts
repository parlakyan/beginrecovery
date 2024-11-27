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
  Timestamp
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
    isVerified: Boolean(data.subscriptionId), // Paid listings are verified
    moderationStatus: data.moderationStatus || 'pending'
  };
};

export const facilitiesService = {
  async getFacilities() {
    try {
      console.log('Fetching facilities from collection:', FACILITIES_COLLECTION);
      
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
      
      console.log('Executing facilities query...');
      const snapshot = await getDocs(q);
      console.log('Query returned:', snapshot.size, 'facilities');
      
      const facilities = snapshot.docs.map(doc => {
        const facility = transformFacilityData(doc);
        console.log('Transformed facility:', facility);
        return facility;
      });

      return { facilities };
    } catch (error) {
      console.error('Error getting facilities:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return { facilities: [] };
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
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'total listings');
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting all listings:', error);
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
