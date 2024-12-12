import { QueryDocumentSnapshot, DocumentData, Timestamp, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FACILITIES_COLLECTION } from './types';
import { Facility, License, Insurance, Condition, Therapy, Substance, Amenity, Language, TreatmentType } from '../../types';

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

interface RawManagedType {
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

const transformManagedType = <T extends RawManagedType>(item: RawManagedType | undefined | null, defaultTimestamp: string): T | undefined => {
  if (typeof item === 'object' && item !== null) {
    return {
      id: item.id || '',
      name: item.name || '',
      description: item.description || '',
      logo: item.logo || '',
      createdAt: item.createdAt instanceof Timestamp 
        ? item.createdAt.toDate().toISOString()
        : (item.createdAt || defaultTimestamp),
      updatedAt: item.updatedAt instanceof Timestamp
        ? item.updatedAt.toDate().toISOString()
        : (item.updatedAt || defaultTimestamp)
    } as T;
  }
  return undefined;
};

// Type guard functions
const isTreatmentType = (item: TreatmentType | undefined): item is TreatmentType => item !== undefined;
const isAmenity = (item: Amenity | undefined): item is Amenity => item !== undefined;
const isLanguage = (item: Language | undefined): item is Language => item !== undefined;
const isSubstance = (item: Substance | undefined): item is Substance => item !== undefined;
const isCondition = (item: Condition | undefined): item is Condition => item !== undefined;
const isTherapy = (item: Therapy | undefined): item is Therapy => item !== undefined;
const isInsurance = (item: Insurance | undefined): item is Insurance => item !== undefined;
const isLicense = (item: License | undefined): item is License => item !== undefined;

export const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
  
  const name = data.name || '';
  const location = data.location || '';
  const city = data.city || '';
  const state = data.state || '';
  
  const defaultTimestamp = new Date().toISOString();
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString()
    : defaultTimestamp;
    
  const updatedAt = data.updatedAt instanceof Timestamp
    ? data.updatedAt.toDate().toISOString()
    : defaultTimestamp;

  // Transform managed types
  const treatmentTypes = (data.treatmentTypes || [])
    .map((item: RawManagedType) => transformManagedType<TreatmentType>(item, defaultTimestamp))
    .filter(isTreatmentType);

  const amenityObjects = (data.amenityObjects || [])
    .map((item: RawManagedType) => transformManagedType<Amenity>(item, defaultTimestamp))
    .filter(isAmenity);

  const languageObjects = (data.languageObjects || [])
    .map((item: RawManagedType) => transformManagedType<Language>(item, defaultTimestamp))
    .filter(isLanguage);

  const substances = (data.substances || [])
    .map((item: RawManagedType) => transformManagedType<Substance>(item, defaultTimestamp))
    .filter(isSubstance);

  const conditions = (data.conditions || [])
    .map((item: RawManagedType) => transformManagedType<Condition>(item, defaultTimestamp))
    .filter(isCondition);

  const therapies = (data.therapies || [])
    .map((item: RawManagedType) => transformManagedType<Therapy>(item, defaultTimestamp))
    .filter(isTherapy);

  const insurances = (data.insurances || [])
    .map((item: RawManagedType) => transformManagedType<Insurance>(item, defaultTimestamp))
    .filter(isInsurance);

  const licenses = (data.licenses || [])
    .map((item: RawManagedType) => transformManagedType<License>(item, defaultTimestamp))
    .filter(isLicense);

  return {
    id: doc.id,
    name,
    description: data.description || '',
    location,
    city,
    state,
    coordinates: data.coordinates,
    amenityObjects,
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
    highlights: data.highlights || [],
    substances,
    insurances,
    accreditation: data.accreditation || [],
    languageObjects,
    licenses,
    conditions,
    therapies,
    treatmentTypes,
    isVerified: Boolean(data.isVerified),
    isFeatured: Boolean(data.isFeatured),
    moderationStatus: data.moderationStatus || 'pending',
    slug: data.slug || generateSlug(name, location),
    logo: data.logo || undefined
  };
};
