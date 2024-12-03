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
 * Facilities management service
 */
export const facilitiesService = {
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
        highlights: data.highlights || [],
        amenities: data.amenities || [],
        tags: data.tags || [],
        substances: data.substances || [],
        insurance: data.insurance || [],
        accreditation: data.accreditation || [],
        languages: data.languages || [],
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
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const facilities = snapshot.docs.map(transformFacilityData);

      return { 
        facilities, 
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: false
      };
    } catch (error) {
      console.error('Error getting facilities:', error);
      return { facilities: [], lastVisible: null, hasMore: false };
    }
  },

  async getFeaturedFacilities() {
    try {
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(BATCH_SIZE)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting featured facilities:', error);
      return [];
    }
  },

  async getFacilityById(id: string) {
    try {
      const docRef = doc(db, FACILITIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
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
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(facilitiesRef, where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
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

  async updateFacility(id: string, data: Partial<Facility>) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      if (data.name || data.location) {
        updateData.slug = generateSlug(data.name || '', data.location || '');
      }

      await updateDoc(facilityRef, updateData);
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
  }
};
