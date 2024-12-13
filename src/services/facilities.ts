import { 
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  orderBy,
  addDoc,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { 
  Facility, 
  TreatmentType, 
  Amenity, 
  Insurance, 
  Condition, 
  Substance, 
  Therapy, 
  Language 
} from '../types';

export interface SearchParams {
  query: string;
  location?: string[];
  treatmentTypes?: string[];
  amenities?: string[];
  insurance?: string[];
  conditions?: string[];
  substances?: string[];
  therapies?: string[];
  languages?: string[];
  rating?: number | null;
}

export interface CreateFacilityData extends Omit<Facility, 'id'> {
  name: string;
  description: string;
  location: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  city: string;
  state: string;
  phone: string;
  email: string;
  images: string[];
  amenityObjects: Amenity[];
  highlights: string[];
  accreditation: string[];
  languageObjects: Language[];
  rating: number;
  reviews: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  claimStatus: 'unclaimed' | 'claimed' | 'disputed';
  createdAt: string;
  updatedAt: string;
}

export const facilitiesService = {
  /**
   * Get all active (non-archived) facilities for admin
   */
  async getAllListingsForAdmin(): Promise<Facility[]> {
    const q = query(
      collection(db, 'facilities'),
      where('moderationStatus', '!=', 'archived'),
      orderBy('moderationStatus'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facility));
  },

  /**
   * Get archived facilities
   */
  async getArchivedListings(): Promise<Facility[]> {
    const q = query(
      collection(db, 'facilities'),
      where('moderationStatus', '==', 'archived'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facility));
  },

  /**
   * Get public facilities (non-archived, approved)
   */
  async getFacilities(): Promise<Facility[]> {
    const q = query(
      collection(db, 'facilities'),
      where('moderationStatus', '==', 'approved'),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facility));
  },

  /**
   * Get featured facilities
   */
  async getFeaturedFacilities(): Promise<Facility[]> {
    const q = query(
      collection(db, 'facilities'),
      where('moderationStatus', '==', 'approved'),
      where('isFeatured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(6)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facility));
  },

  /**
   * Get user's facilities
   */
  async getUserListings(userId: string): Promise<Facility[]> {
    const q = query(
      collection(db, 'facilities'),
      where('ownerId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Facility));
  },

  /**
   * Search facilities
   */
  async searchFacilities(params: SearchParams): Promise<Facility[]> {
    // For now, get all and filter in memory
    // TODO: Implement proper search with Algolia or similar
    const facilities = await this.getFacilities();
    const searchLower = params.query.toLowerCase();
    
    return facilities.filter(facility => {
      // Basic search match
      const matchesSearch = searchLower === '' || 
        facility.name.toLowerCase().includes(searchLower) ||
        (facility.location || '').toLowerCase().includes(searchLower) ||
        (facility.city || '').toLowerCase().includes(searchLower) ||
        (facility.state || '').toLowerCase().includes(searchLower);

      // Location match - handle city, state format
      const matchesLocation = !params.location?.length || params.location.some(loc => {
        const [city, state] = loc.split(',').map(s => s.trim().toLowerCase());
        return (facility.city?.toLowerCase() === city && facility.state?.toLowerCase() === state);
      });

      // Collection matches
      const matchesTreatmentTypes = !params.treatmentTypes?.length || 
        facility.treatmentTypes?.some(type => params.treatmentTypes?.includes(type.id));

      const matchesAmenities = !params.amenities?.length ||
        facility.amenityObjects?.some(amenity => params.amenities?.includes(amenity.id));

      const matchesInsurance = !params.insurance?.length ||
        facility.insurances?.some(ins => params.insurance?.includes(ins.id));

      const matchesConditions = !params.conditions?.length ||
        facility.conditions?.some(condition => params.conditions?.includes(condition.id));

      const matchesSubstances = !params.substances?.length ||
        facility.substances?.some(substance => params.substances?.includes(substance.id));

      const matchesTherapies = !params.therapies?.length ||
        facility.therapies?.some(therapy => params.therapies?.includes(therapy.id));

      const matchesLanguages = !params.languages?.length ||
        facility.languageObjects?.some(lang => params.languages?.includes(lang.id));

      const matchesRating = !params.rating ||
        (facility.rating && facility.rating >= (params.rating || 0));

      return matchesSearch &&
        matchesLocation &&
        matchesTreatmentTypes &&
        matchesAmenities &&
        matchesInsurance &&
        matchesConditions &&
        matchesSubstances &&
        matchesTherapies &&
        matchesLanguages &&
        matchesRating;
    });
  },

  /**
   * Get facility by ID
   */
  async getFacility(id: string): Promise<Facility | null> {
    const docRef = doc(db, 'facilities', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Facility;
  },

  /**
   * Get facility by ID (alias for getFacility)
   */
  async getFacilityById(id: string): Promise<Facility | null> {
    return this.getFacility(id);
  },

  /**
   * Get facility by slug
   */
  async getFacilityBySlug(slug: string): Promise<Facility | null> {
    const q = query(
      collection(db, 'facilities'),
      where('slug', '==', slug),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Facility;
  },

  /**
   * Create new facility with default values
   */
  async createFacility(data: Partial<Facility>): Promise<{ id: string }> {
    // Set default values for required fields
    const defaultData: CreateFacilityData = {
      name: data.name || '',
      description: data.description || '',
      location: data.location || '',
      coordinates: data.coordinates || { lat: 0, lng: 0 },
      city: data.city || '',
      state: data.state || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website,
      images: data.images || [],
      logo: data.logo,
      treatmentTypes: data.treatmentTypes || [],
      amenityObjects: data.amenityObjects || [],
      highlights: data.highlights || [],
      substances: data.substances || [],
      conditions: data.conditions || [],
      therapies: data.therapies || [],
      insurances: data.insurances || [],
      accreditation: data.accreditation || [],
      languageObjects: data.languageObjects || [],
      licenses: data.licenses || [],
      rating: data.rating || 0,
      reviews: data.reviews || 0,
      reviewCount: data.reviewCount || 0,
      isVerified: false,
      isFeatured: false,
      moderationStatus: data.moderationStatus || 'pending',
      claimStatus: data.claimStatus || 'unclaimed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: data.ownerId || 'admin',
      slug: data.slug || ''
    };

    const docRef = await addDoc(collection(db, 'facilities'), {
      ...defaultData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id };
  },

  /**
   * Update facility
   */
  async updateFacility(id: string, data: Partial<Facility>): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Delete facility
   */
  async deleteFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await deleteDoc(docRef);
  },

  /**
   * Moderation actions
   */
  async approveFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      moderationStatus: 'approved',
      updatedAt: serverTimestamp()
    });
  },

  async rejectFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      moderationStatus: 'rejected',
      updatedAt: serverTimestamp()
    });
  },

  async archiveFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      moderationStatus: 'archived',
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Verification actions
   */
  async verifyFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      isVerified: true,
      updatedAt: serverTimestamp()
    });
  },

  async unverifyFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      isVerified: false,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Feature actions
   */
  async featureFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      isFeatured: true,
      updatedAt: serverTimestamp()
    });
  },

  async unfeatureFacility(id: string): Promise<void> {
    const docRef = doc(db, 'facilities', id);
    await updateDoc(docRef, {
      isFeatured: false,
      updatedAt: serverTimestamp()
    });
  },

  /**
   * Migration helpers
   */
  async migrateExistingSlugs(): Promise<void> {
    const facilities = await this.getFacilities();
    for (const facility of facilities) {
      if (!facility.slug) {
        await this.updateFacility(facility.id, {
          slug: facility.id // Temporary slug using ID
        });
      }
    }
  }
};
