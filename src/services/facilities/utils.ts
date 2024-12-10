import { QueryDocumentSnapshot, DocumentData, Timestamp, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Facility, License, Insurance } from '../../types';
import { FACILITIES_COLLECTION } from './types';

/**
 * Generates URL-friendly slug from facility name and location
 */
export const generateSlug = (name: string, location: string): string => {
  const cleanName = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  if (!location) {
    return cleanName;
  }

  const cleanLocation = location
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  return `${cleanName}-${cleanLocation}`;
};

/**
 * Migrate existing facilities to include slugs
 */
export const migrateExistingSlugs = async () => {
  try {
    const facilitiesRef = collection(db, FACILITIES_COLLECTION);
    const snapshot = await getDocs(facilitiesRef);
    
    const updates = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      if (!data.slug) {
        const name = data.name || '';
        const location = data.location || '';
        const slug = generateSlug(name, location);
        
        const facilityRef = doc(db, FACILITIES_COLLECTION, docSnap.id);
        return updateDoc(facilityRef, { slug });
      }
      return Promise.resolve();
    });

    await Promise.all(updates);
    console.log('Slug migration completed successfully');
  } catch (error) {
    console.error('Error migrating slugs:', error);
    throw error;
  }
};

interface RawLicense {
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

interface RawInsurance {
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

/**
 * Transforms Firestore document to Facility type
 * Handles license and insurance data transformation and verification status
 */
export const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
  
  const name = data.name || '';
  const location = data.location || '';
  const city = data.city || '';
  const state = data.state || '';
  
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString()
    : new Date().toISOString();
    
  const updatedAt = data.updatedAt instanceof Timestamp
    ? data.updatedAt.toDate().toISOString()
    : new Date().toISOString();

  // Transform licenses data to ensure it matches the License type
  const licenses = (data.licenses || []).map((license: RawLicense) => {
    if (typeof license === 'object' && license !== null) {
      return {
        id: license.id || '',
        name: license.name || '',
        description: license.description || '',
        logo: license.logo || '',
        createdAt: license.createdAt instanceof Timestamp 
          ? license.createdAt.toDate().toISOString()
          : (license.createdAt || new Date().toISOString()),
        updatedAt: license.updatedAt instanceof Timestamp
          ? license.updatedAt.toDate().toISOString()
          : (license.updatedAt || new Date().toISOString())
      } as License;
    }
    return null;
  }).filter(Boolean) as License[];

  // Transform insurances data to ensure it matches the Insurance type
  const insurances = (data.insurances || []).map((insurance: RawInsurance) => {
    if (typeof insurance === 'object' && insurance !== null) {
      return {
        id: insurance.id || '',
        name: insurance.name || '',
        description: insurance.description || '',
        logo: insurance.logo || '',
        createdAt: insurance.createdAt instanceof Timestamp 
          ? insurance.createdAt.toDate().toISOString()
          : (insurance.createdAt || new Date().toISOString()),
        updatedAt: insurance.updatedAt instanceof Timestamp
          ? insurance.updatedAt.toDate().toISOString()
          : (insurance.updatedAt || new Date().toISOString())
      } as Insurance;
    }
    return null;
  }).filter(Boolean) as Insurance[];

  return {
    id: doc.id,
    name,
    description: data.description || '',
    location,
    city,
    state,
    coordinates: data.coordinates,
    amenities: data.amenities || [],
    images: data.images || [],
    status: data.status || 'pending',
    ownerId: data.ownerId || '',
    rating: data.rating || 0,
    reviews: data.reviews || 0,
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
    insurances,
    accreditation: data.accreditation || [],
    languages: data.languages || [],
    licenses,
    isVerified: Boolean(data.isVerified),
    isFeatured: Boolean(data.isFeatured),
    moderationStatus: data.moderationStatus || 'pending',
    slug: data.slug || generateSlug(name, location),
    logo: data.logo || undefined
  };
};
