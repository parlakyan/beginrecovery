import { collection, getDocs, getDoc, doc, query, where, orderBy, serverTimestamp, limit, DocumentData, QueryDocumentSnapshot, writeBatch, addDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Facility } from '../types';

interface SearchFilters {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}

/**
 * Transform Firestore document to Facility type
 */
const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
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
    email: data.email || '',
    tags: data.tags || [],
    isVerified: Boolean(data.isVerified),
    isFeatured: Boolean(data.isFeatured),
    moderationStatus: data.moderationStatus || 'pending',
    slug: data.slug || ''
  };
};

/**
 * Filter facilities based on search criteria
 */
const filterFacilities = (facilities: Facility[], filters: SearchFilters): Facility[] => {
  return facilities.filter(facility => {
    // Treatment Types filter
    if (filters.treatmentTypes.length > 0 && 
        !filters.treatmentTypes.some(type => facility.tags.includes(type))) {
      return false;
    }

    // Amenities filter
    if (filters.amenities.length > 0 && 
        !filters.amenities.some(amenity => facility.amenities.includes(amenity))) {
      return false;
    }

    // Rating filter
    if (filters.rating !== null && facility.rating < filters.rating) {
      return false;
    }

    // Price Range filter - Not implemented yet as price is not in the model
    // if (filters.priceRange !== null) {
    //   const [min, max] = filters.priceRange;
    //   if (facility.price < min || facility.price > max) {
    //     return false;
    //   }
    // }

    return true;
  });
};

export const facilitiesService = {
  /**
   * Get all facilities with optional filters
   */
  async getFacilities(filters?: SearchFilters) {
    try {
      console.log('Fetching facilities with filters:', filters);
      const facilitiesRef = collection(db, 'facilities');
      
      // Create index for compound query
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      let facilities = snapshot.docs.map(transformFacilityData);

      // Apply filters if provided
      if (filters) {
        facilities = filterFacilities(facilities, filters);
      }

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

  /**
   * Get featured facilities
   */
  async getFeaturedFacilities() {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(transformFacilityData);
    } catch (error) {
      console.error('Error getting featured facilities:', error);
      return [];
    }
  },

  /**
   * Get facility by ID
   */
  async getFacilityById(id: string) {
    try {
      const docRef = doc(db, 'facilities', id);
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

  /**
   * Get facility by slug
   */
  async getFacilityBySlug(slug: string) {
    try {
      const facilitiesRef = collection(db, 'facilities');
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

  /**
   * Get user's listings
   */
  async getUserListings(userId: string) {
    try {
      const facilitiesRef = collection(db, 'facilities');
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

  /**
   * Create new facility
   */
  async createFacility(data: Partial<Facility>) {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const docRef = await addDoc(facilitiesRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  },

  /**
   * Update facility
   */
  async updateFacility(id: string, data: Partial<Facility>) {
    try {
      const facilityRef = doc(db, 'facilities', id);
      await updateDoc(facilityRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  },

  /**
   * Delete facility
   */
  async deleteFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
      await deleteDoc(facilityRef);
      return true;
    } catch (error) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  }
};
