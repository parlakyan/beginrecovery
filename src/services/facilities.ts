import { collection, getDocs, getDoc, doc, query, where, orderBy, serverTimestamp, limit, startAfter, DocumentData, QueryDocumentSnapshot, writeBatch, addDoc, updateDoc, deleteDoc, setDoc, WithFieldValue } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Facility } from '../types';

interface SearchFilters {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: [number, number] | null;
  query?: string;
}

interface PaginationParams {
  pageSize?: number;
  lastVisible?: QueryDocumentSnapshot<DocumentData>;
}

interface FacilityDocument extends DocumentData {
  name: string;
  description: string;
  location: string;
  amenities: string[];
  images: string[];
  status: 'pending' | 'active' | 'suspended';
  ownerId: string;
  rating: number;
  reviewCount: number;
  createdAt: { toDate(): Date };
  updatedAt: { toDate(): Date };
  subscriptionId?: string;
  phone: string;
  email: string;
  tags: string[];
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  slug: string;
}

/**
 * Transform Firestore document to Facility type
 */
const transformFacilityData = (doc: QueryDocumentSnapshot<FacilityDocument>): Facility => {
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
 * Build query with server-side filters
 */
const buildFilteredQuery = (facilitiesRef: any, filters?: SearchFilters, pagination?: PaginationParams) => {
  let q = query(facilitiesRef, where('moderationStatus', '==', 'approved'));

  // Apply server-side filters
  if (filters) {
    if (filters.rating !== null) {
      q = query(q, where('rating', '>=', filters.rating));
    }
  }

  // Add ordering
  q = query(q, orderBy('rating', 'desc'), orderBy('createdAt', 'desc'));

  // Add pagination
  if (pagination) {
    const { pageSize = 12, lastVisible } = pagination;
    q = query(q, limit(pageSize));
    if (lastVisible) {
      q = query(q, startAfter(lastVisible));
    }
  } else {
    q = query(q, limit(12)); // Default page size
  }

  return q;
};

/**
 * Apply client-side filters that can't be done in Firestore
 */
const applyClientFilters = (facilities: Facility[], filters: SearchFilters): Facility[] => {
  return facilities.filter(facility => {
    // Text search
    if (filters.query) {
      const searchTerms = filters.query.toLowerCase().split(' ');
      const searchableText = [
        facility.name,
        facility.description,
        facility.location,
        ...facility.tags,
        ...facility.amenities
      ].join(' ').toLowerCase();

      if (!searchTerms.every(term => searchableText.includes(term))) {
        return false;
      }
    }

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

    return true;
  });
};

export const facilitiesService = {
  /**
   * Get facilities with pagination and filters
   */
  async getFacilities(filters?: SearchFilters, pagination?: PaginationParams) {
    try {
      console.log('Fetching facilities:', { filters, pagination });
      const facilitiesRef = collection(db, 'facilities');
      
      // Build query with server-side filters and pagination
      const q = buildFilteredQuery(facilitiesRef, filters, pagination);
      
      // Execute query
      const snapshot = await getDocs(q);
      let facilities = snapshot.docs.map(doc => transformFacilityData(doc as QueryDocumentSnapshot<FacilityDocument>));

      // Apply remaining filters client-side
      if (filters) {
        facilities = applyClientFilters(facilities, filters);
      }

      // Check if there are more results
      const hasMore = !pagination?.pageSize || snapshot.docs.length === pagination.pageSize;

      return { 
        facilities, 
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore
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
      return snapshot.docs.map(doc => transformFacilityData(doc as QueryDocumentSnapshot<FacilityDocument>));
    } catch (error) {
      console.error('Error getting featured facilities:', error);
      return [];
    }
  },

  /**
   * Get all listings for admin
   */
  async getAllListingsForAdmin() {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const q = query(facilitiesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => transformFacilityData(doc as QueryDocumentSnapshot<FacilityDocument>));
    } catch (error) {
      console.error('Error getting all listings:', error);
      return [];
    }
  },

  /**
   * Get archived listings
   */
  async getArchivedListings() {
    try {
      const facilitiesRef = collection(db, 'facilities');
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'archived'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => transformFacilityData(doc as QueryDocumentSnapshot<FacilityDocument>));
    } catch (error) {
      console.error('Error getting archived listings:', error);
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
      
      return transformFacilityData(docSnap as QueryDocumentSnapshot<FacilityDocument>);
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
      
      return transformFacilityData(snapshot.docs[0] as QueryDocumentSnapshot<FacilityDocument>);
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
      return snapshot.docs.map(doc => transformFacilityData(doc as QueryDocumentSnapshot<FacilityDocument>));
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
  },

  /**
   * Approve facility
   */
  async approveFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
      await updateDoc(facilityRef, {
        moderationStatus: 'approved' as const,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error approving facility:', error);
      throw error;
    }
  },

  /**
   * Reject facility
   */
  async rejectFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
      await updateDoc(facilityRef, {
        moderationStatus: 'rejected' as const,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error rejecting facility:', error);
      throw error;
    }
  },

  /**
   * Archive facility
   */
  async archiveFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
      await updateDoc(facilityRef, {
        moderationStatus: 'archived' as const,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error archiving facility:', error);
      throw error;
    }
  },

  /**
   * Restore facility from archive
   */
  async restoreFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
      await updateDoc(facilityRef, {
        moderationStatus: 'pending' as const,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error restoring facility:', error);
      throw error;
    }
  },

  /**
   * Feature facility
   */
  async featureFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
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

  /**
   * Unfeature facility
   */
  async unfeatureFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
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

  /**
   * Verify facility
   */
  async verifyFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
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

  /**
   * Unverify facility
   */
  async unverifyFacility(id: string) {
    try {
      const facilityRef = doc(db, 'facilities', id);
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
