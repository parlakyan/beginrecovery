/**
 * User Interface
 */
export interface User {
  id: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

/**
 * Coordinates Interface
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Collection Types
 */
export type CollectionType = 'treatmentTypes' | 'amenities' | 'insurance';

/**
 * Facility Interface
 */
export interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates?: Coordinates;
  amenities: string[];
  images: string[];
  status: 'pending' | 'active' | 'suspended';
  ownerId: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  subscriptionId?: string;
  phone?: string;
  email?: string;
  tags: string[];
  insurance: string[];
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  slug: string;
}

/**
 * Create User Data Interface
 */
export interface CreateUserData {
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

/**
 * Facility With Contact Interface
 */
export interface FacilityWithContact extends Facility {
  phone: string;
}

/**
 * Search Filters State Interface
 */
export interface SearchFiltersState {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}
