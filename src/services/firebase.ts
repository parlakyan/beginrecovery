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

const generateSlug = (name: string, location: string): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  // Handle cases where location might be undefined or malformed
  if (!location) {
    return cleanName;
  }

  const parts = location.split(',');
  if (parts.length < 2) {
    return `${cleanName}-${location.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')}`;
  }

  const [city, stateWithSpaces] = parts.map(part => part.trim());
  const state = stateWithSpaces
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  const cleanCity = city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  return `${cleanName}-${cleanCity}-${state}`;
};

const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
  console.log('Raw facility data:', { id: doc.id, ...data });
  
  const name = data.name || '';
  const location = data.location || '';
  
  return {
    id: doc.id,
    name,
    description: data.description || '',
    location,
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
    isVerified: Boolean(data.isVerified),
    isFeatured: Boolean(data.isFeatured),
    moderationStatus: data.moderationStatus || 'pending',
    slug: data.slug || generateSlug(name, location)
  };
};

export const facilitiesService = {
  async migrateExistingSlugs() {
    try {
      console.log('Starting facility slug migration');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const snapshot = await getDocs(facilitiesRef);
      const batch = writeBatch(db);
      let updateCount = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const name = data.name || '';
        const location = data.location || '';
        const slug = generateSlug(name, location);
        
        // Always update to ensure consistent slugs
        batch.update(doc.ref, { slug });
        updateCount++;
      });

      if (updateCount > 0) {
        await batch.commit();
        console.log(`Updated ${updateCount} facilities with slugs`);
      } else {
        console.log('No facilities needed slug updates');
      }
    } catch (error) {
      console.error('Error migrating facility slugs:', error);
      throw error;
    }
  },

  async getFacilities(lastDoc?: QueryDocumentSnapshot<DocumentData>) {
    try {
      console.log('Fetching approved facilities from collection:', FACILITIES_COLLECTION);
      
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const testQuery = query(facilitiesRef);
      const testSnapshot = await getDocs(testQuery);
      console.log('Total documents in collection:', testSnapshot.size);
      
      if (testSnapshot.size === 0) {
        console.log('No documents found in collection');
        return { facilities: [], lastVisible: null, hasMore: false };
      }

      const baseQuery = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );
      
      const snapshot = await getDocs(baseQuery);
      console.log('Query returned:', snapshot.size, 'approved facilities');
      
      const facilities = snapshot.docs.map(transformFacilityData);
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;
      const hasMore = snapshot.docs.length === BATCH_SIZE;

      return { facilities, lastVisible, hasMore };
    } catch (error) {
      console.error('Error getting facilities:', error);
      return { facilities: [], lastVisible: null, hasMore: false };
    }
  },

  async getFeaturedFacilities() {
    try {
      console.log('Fetching featured facilities');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        where('isFeatured', '==', true),
        limit(BATCH_SIZE)
      );
      
      const snapshot = await getDocs(q);
      console.log('Found', snapshot.size, 'featured facilities');
      
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting featured facilities:', error);
      return [];
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
      
      return transformFacilityData(docSnap);
    } catch (error) {
      console.error('Error getting facility:', error);
      return null;
    }
  },

  async getFacilityBySlug(slug: string) {
    try {
      console.log('Fetching facility by slug:', slug);
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(facilitiesRef, where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No facility found with slug:', slug);
        return null;
      }
      
      return transformFacilityData(snapshot.docs[0]);
    } catch (error) {
      console.error('Error getting facility by slug:', error);
      return null;
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
      const testQuery = query(facilitiesRef);
      const snapshot = await getDocs(testQuery);
      
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
        where('moderationStatus', '==', 'archived')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting archived listings:', error);
      return [];
    }
  },

  async updateFacility(id: string, data: Partial<Facility>) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      // Generate new slug if name or location is updated
      if (data.name || data.location) {
        const facilityDoc = await getDoc(facilityRef);
        const currentData = facilityDoc.data();
        const name = data.name || currentData?.name;
        const location = data.location || currentData?.location;
        updateData.slug = generateSlug(name, location);
      }

      await updateDoc(facilityRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  },

  async approveFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'approved',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error approving facility:', error);
      throw error;
    }
  },

  async rejectFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'rejected',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error rejecting facility:', error);
      throw error;
    }
  },

  async verifyFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isVerified: true,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error verifying facility:', error);
      throw error;
    }
  },

  async unverifyFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isVerified: false,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error unverifying facility:', error);
      throw error;
    }
  },

  async featureFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isFeatured: true,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error featuring facility:', error);
      throw error;
    }
  },

  async unfeatureFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isFeatured: false,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error unfeaturing facility:', error);
      throw error;
    }
  },

  async archiveFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'archived',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error archiving facility:', error);
      throw error;
    }
  },

  async restoreFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'pending',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error restoring facility:', error);
      throw error;
    }
  },

  async deleteFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await deleteDoc(facilityRef);
      return true;
    } catch (error) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  }
};
