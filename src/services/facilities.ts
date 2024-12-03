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
  writeBatch,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  enableNetwork,
  disableNetwork,
  Timestamp
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebase';
import { Facility, User } from '../types';

// Collection names
const FACILITIES_COLLECTION = 'facilities';
const USERS_COLLECTION = 'users';
const BATCH_SIZE = 12;

// Get auth instance
const auth = getAuth();

/**
 * Network connectivity service
 */
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

/**
 * Input type for user creation
 */
interface CreateUserInput {
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

// Add searchFacilities interface
interface SearchParams {
  query: string;
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
}

/**
 * Generates URL-friendly slug from facility name and location
 */
const generateSlug = (name: string, location: string): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

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

/**
 * Transforms Firestore document to Facility type
 */
const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
  
  const name = data.name || '';
  const location = data.location || '';
  
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString()
    : new Date().toISOString();
    
  const updatedAt = data.updatedAt instanceof Timestamp
    ? data.updatedAt.toDate().toISOString()
    : new Date().toISOString();

  return {
    id: doc.id,
    name,
    description: data.description || '',
    location,
    coordinates: data.coordinates,
    amenities: data.amenities || [],
    images: data.images || [],
    status: data.status || 'pending',
    ownerId: data.ownerId || '',
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    createdAt,
    updatedAt,
    subscriptionId: data.subscriptionId,
    phone: data.phone || '',
    email: data.email || '',
    tags: data.tags || [],
    highlights: data.highlights || [],
    substances: data.substances || [],
    insurance: data.insurance || [],
    accreditation: data.accreditation || [],
    languages: data.languages || [],
    isVerified: Boolean(data.isVerified),
    isFeatured: Boolean(data.isFeatured),
    moderationStatus: data.moderationStatus || 'pending',
    slug: data.slug || generateSlug(name, location)
  };
};

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
  }
};

/**
 * Facilities management service
 */
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

  async createFacility(data: Partial<Facility>) {
    try {
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const facilityData = {
        ...data,
        ownerId: auth.currentUser?.uid,
        rating: 0,
        reviewCount: 0,
        status: 'pending',
        moderationStatus: 'pending',
        isVerified: false,
        isFeatured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        slug: generateSlug(data.name || '', data.location || '')
      };

      const docRef = await addDoc(facilitiesRef, facilityData);
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  },

  async getFacilities() {
    try {
      console.log('Fetching facilities');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Create index for compound query
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing facilities query');
      const snapshot = await getDocs(q);
      console.log('Total documents:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed facilities:', facilities.length);

      return { 
        facilities, 
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: false
      };
    } catch (error) {
      console.error('Error getting facilities:', error);
      
      // If compound query fails, try simple query
      try {
        console.log('Falling back to simple query');
        const snapshot = await getDocs(collection(db, FACILITIES_COLLECTION));
        
        const facilities = snapshot.docs
          .map(transformFacilityData)
          .filter(f => f.moderationStatus === 'approved')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('Fallback query successful:', facilities.length);
        
        return {
          facilities,
          lastVisible: null,
          hasMore: false
        };
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        return { facilities: [], lastVisible: null, hasMore: false };
      }
    }
  },

  async getUserListings(userId: string) {
    try {
      console.log('Fetching listings for user:', userId);
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Create index for compound query
      const q = query(
        facilitiesRef,
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing user listings query:', {
        userId,
        timestamp: new Date().toISOString()
      });

      const snapshot = await getDocs(q);
      console.log('User listings found:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed user listings:', facilities.length);
      
      return facilities;
    } catch (error) {
      console.error('Error getting user listings:', error);
      
      // If compound query fails, try simple query
      try {
        console.log('Falling back to simple query for user listings');
        const snapshot = await getDocs(collection(db, FACILITIES_COLLECTION));
        
        const facilities = snapshot.docs
          .map(transformFacilityData)
          .filter(f => f.ownerId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('Fallback query successful:', facilities.length);
        return facilities;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        return [];
      }
    }
  },

  async getFeaturedFacilities() {
    try {
      console.log('Fetching featured facilities');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Create index for compound query
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(BATCH_SIZE)
      );
      
      console.log('Executing featured facilities query');
      const snapshot = await getDocs(q);
      console.log('Featured documents:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed featured facilities:', facilities.length);
      
      return facilities;
    } catch (error) {
      console.error('Error getting featured facilities:', error);
      
      // If compound query fails, try simple query
      try {
        console.log('Falling back to simple query');
        const snapshot = await getDocs(collection(db, FACILITIES_COLLECTION));
        
        const facilities = snapshot.docs
          .map(transformFacilityData)
          .filter(f => f.moderationStatus === 'approved' && f.isFeatured)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, BATCH_SIZE);
        
        console.log('Fallback query successful:', facilities.length);
        return facilities;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        return [];
      }
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
      
      return transformFacilityData(docSnap as QueryDocumentSnapshot<DocumentData>);
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

  async updateFacility(id: string, data: Partial<Facility>) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      
      // Create a clean update object without undefined values
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Add server timestamp
      cleanData.updatedAt = serverTimestamp();

      // Update slug if name or location changed
      if (data.name || data.location) {
        const facilityDoc = await getDoc(facilityRef);
        const currentData = facilityDoc.data();
        const name = data.name || currentData?.name;
        const location = data.location || currentData?.location;
        cleanData.slug = generateSlug(name, location);
      }

      // Convert null values to undefined to prevent Firebase errors
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === null) {
          cleanData[key] = undefined;
        }
      });

      await updateDoc(facilityRef, cleanData);
      return true;
    } catch (error) {
      console.error('Error updating facility:', error);
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

  async searchFacilities({
    query: searchQuery,
    treatmentTypes,
    amenities,
    insurance,
    rating
  }: SearchParams): Promise<Facility[]> {
    try {
      console.log('Searching facilities:', {
        query: searchQuery,
        treatmentTypes,
        amenities,
        insurance,
        rating
      });

      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Start with base query for approved facilities
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );

      // Get all facilities and filter in memory
      // This is a temporary solution until we implement proper search indexing
      const snapshot = await getDocs(q);
      let facilities = snapshot.docs.map(doc => transformFacilityData(doc as QueryDocumentSnapshot<DocumentData>));

      // Apply filters
      facilities = facilities.filter(facility => {
        // Text search
        const searchText = searchQuery.toLowerCase();
        const matchesQuery = !searchQuery || 
          facility.name.toLowerCase().includes(searchText) ||
          facility.description.toLowerCase().includes(searchText) ||
          facility.location.toLowerCase().includes(searchText);

        // Treatment types
        const matchesTreatment = treatmentTypes.length === 0 ||
          treatmentTypes.some(type => facility.tags.includes(type));

        // Amenities
        const matchesAmenities = amenities.length === 0 ||
          amenities.some(amenity => facility.amenities.includes(amenity));

        // Insurance
        const matchesInsurance = insurance.length === 0 ||
          insurance.some(ins => facility.insurance.includes(ins));

        // Rating
        const matchesRating = !rating || facility.rating >= rating;

        return matchesQuery && 
               matchesTreatment && 
               matchesAmenities && 
               matchesInsurance && 
               matchesRating;
      });

      // Sort by rating and then name
      facilities.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return a.name.localeCompare(b.name);
      });

      console.log('Search results:', facilities.length);
      return facilities;
    } catch (error) {
      console.error('Error searching facilities:', error);
      return [];
    }
  }
};
