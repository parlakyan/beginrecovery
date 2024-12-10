import { QueryDocumentSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { Facility, License } from '../../types';

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

  const parts = location.split(',').map(part => part.trim());
  
  // Handle cases where location doesn't have city,state format
  if (parts.length < 2) {
    const cleanLocation = location
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    return `${cleanName}-${cleanLocation}`;
  }

  const [city, state] = parts;
  const cleanCity = city
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
  const cleanState = state
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

  return `${cleanName}-${cleanCity}-${cleanState}`;
};

interface RawLicense {
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

/**
 * Transforms Firestore document to Facility type
 * Handles license data transformation and verification status
 */
export const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
  
  const name = data.name || '';
  const location = data.location || '';
  
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

  return {
    id: doc.id,
    name,
    description: data.description || '',
    location,
    city: data.city,
    state: data.state,
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
