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
  Timestamp,
  setDoc
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebase';
import { Facility, User } from '../types';

const FACILITIES_COLLECTION = 'facilities';
const USERS_COLLECTION = 'users';
const BATCH_SIZE = 12;

// Get auth instance directly
const auth = getAuth();

interface SearchParams {
  query?: string;
  location?: string;
  tags?: string[];
  insurance?: string[];
  rating?: number;
}

interface CreateUserInput {
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

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
      console.log('Fetching approved facilities from collection:', FACILITIES_COLLECTION);
      
      // First, let's check if we can get any documents at all
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const testQuery = query(facilitiesRef);
      const testSnapshot = await getDocs(testQuery);
      console.log('Total documents in collection:', testSnapshot.size);
      
      if (testSnapshot.size === 0) {
        console.log('No documents found in collection. Please check:');
        console.log('1. Collection name:', FACILITIES_COLLECTION);
        console.log('2. Firebase connection:', db);
        return { facilities: [], lastVisible: null, hasMore: false };
      }

      // Now query for approved facilities
      const baseQuery = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );
      
      const snapshot = await getDocs(baseQuery);
      console.log('Query returned:', snapshot.size, 'approved facilities');
      
      snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        console.log('Facility data:', {
          id: doc.id,
          name: data.name,
          moderationStatus: data.moderationStatus,
          isVerified: Boolean(data.subscriptionId)
        });
      });
      
      const facilities = snapshot.docs.map(transformFacilityData);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
      const hasMore = snapshot.docs.length === BATCH_SIZE;

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
      
      // First, let's check if we can get any documents at all
      const testQuery = query(facilitiesRef);
      const testSnapshot = await getDocs(testQuery);
      console.log('Total documents in collection:', testSnapshot.size);
      
      if (testSnapshot.size === 0) {
        console.log('No documents found in collection. Please check:');
        console.log('1. Collection name:', FACILITIES_COLLECTION);
        console.log('2. Firebase connection:', db);
        return [];
      }

      // Log all documents to see what we have
      testSnapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        console.log('Document data:', {
          id: doc.id,
          name: data.name,
          moderationStatus: data.moderationStatus,
          isVerified: Boolean(data.subscriptionId)
        });
      });

      // Filter in memory instead of in query
      const facilities = testSnapshot.docs.map(transformFacilityData);
      const activeFacilities = facilities.filter((facility: Facility) => facility.moderationStatus !== 'archived');
      console.log('Active facilities:', activeFacilities);

      return activeFacilities;
    } catch (error) {
      console.error('Error getting all listings:', error);
      return [];
    }
  },

  async getArchivedListings() {
    try {
      console.log('Fetching archived listings');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // First, let's check if we can get any documents at all
      const testQuery = query(facilitiesRef);
      const testSnapshot = await getDocs(testQuery);
      console.log('Total documents in collection:', testSnapshot.size);
      
      if (testSnapshot.size === 0) {
        console.log('No documents found in collection. Please check:');
        console.log('1. Collection name:', FACILITIES_COLLECTION);
        console.log('2. Firebase connection:', db);
        return [];
      }

      // Now query for archived facilities
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'archived')
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'archived listings');
      
      snapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const data = doc.data();
        console.log('Archived listing data:', {
          id: doc.id,
          name: data.name,
          moderationStatus: data.moderationStatus
        });
      });

      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting archived listings:', error);
      return [];
    }
  },

  async searchFacilities(params: SearchParams) {
    try {
      console.log('Searching facilities with params:', params);
      
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      let baseQuery = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );

      if (params.location) {
        baseQuery = query(
          baseQuery,
          where('location', '>=', params.location.toLowerCase()),
          where('location', '<=', params.location.toLowerCase() + '\uf8ff')
        );
      }

      const snapshot = await getDocs(baseQuery);
      console.log('Search returned:', snapshot.size, 'facilities');
      
      let facilities = snapshot.docs.map(transformFacilityData);

      // Apply filters in memory
      if (params.query) {
        const searchTerm = params.query.toLowerCase();
        facilities = facilities.filter(facility => 
          facility.name.toLowerCase().includes(searchTerm) ||
          facility.description.toLowerCase().includes(searchTerm)
        );
      }

      if (params.rating) {
        facilities = facilities.filter(facility => facility.rating >= params.rating!);
      }

      if (params.tags?.length) {
        facilities = facilities.filter(facility =>
          params.tags!.some(tag => facility.tags.includes(tag))
        );
      }

      if (params.insurance?.length) {
        facilities = facilities.filter(facility =>
          params.insurance!.some(insurance => facility.amenities.includes(insurance))
        );
      }

      // Sort by rating
      facilities.sort((a, b) => b.rating - a.rating);

      return facilities;
    } catch (error) {
      console.error('Error searching facilities:', error);
      return [];
    }
  },

  async getNearbyFacilities(location: string, resultLimit = 6) {
    try {
      console.log('Fetching nearby facilities for location:', location);
      
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      // Simplified query to avoid compound query errors
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        where('location', '>=', location.toLowerCase()),
        limit(resultLimit)
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'nearby facilities');
      
      // Sort in memory instead of in query
      const facilities = snapshot.docs.map(transformFacilityData)
        .sort((a, b) => b.rating - a.rating);
      
      return facilities;
    } catch (error) {
      console.error('Error getting nearby facilities:', error);
      return [];
    }
  },

  async getTopRatedFacilities(resultLimit = 6) {
    try {
      console.log('Fetching top rated facilities');
      
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      // Simplified query to avoid compound query errors
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        limit(resultLimit * 2) // Fetch more to account for sorting
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'facilities');
      
      // Sort in memory and limit results
      const facilities = snapshot.docs.map(transformFacilityData)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, resultLimit);
      
      return facilities;
    } catch (error) {
      console.error('Error getting top rated facilities:', error);
      return [];
    }
  }
};
