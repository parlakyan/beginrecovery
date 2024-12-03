/**
 * User Interface
 * Represents a user in the system
 * Used for authentication and authorization
 * 
 * @property id - Firebase Auth UID
 * @property email - User's email address (null if not provided)
 * @property role - User's role in the system
 * @property createdAt - ISO timestamp of account creation
 */
export interface User {
  id: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

/**
 * Coordinates Interface
 * Represents geographical coordinates
 * Used for mapping and location-based features
 * 
 * @property lat - Latitude
 * @property lng - Longitude
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Facility Interface
 * Represents a rehabilitation facility listing
 * Core data structure for facility management
 * 
 * @property id - Unique identifier
 * @property name - Facility name
 * @property description - Detailed description
 * @property location - Physical location (City, State)
 * @property coordinates - Geographical coordinates for mapping
 * @property logo - Facility logo URL
 * @property highlights - Key facility highlights
 * @property amenities - Available amenities
 * @property treatmentTypes - Types of treatment offered
 * @property substances - Substances treated
 * @property insurance - Accepted insurance providers
 * @property accreditation - Facility accreditations
 * @property languages - Languages supported
 * @property images - List of image URLs
 * @property status - Subscription/payment status
 * @property ownerId - Firebase UID of facility owner
 * @property rating - Average rating (0-5)
 * @property reviewCount - Number of reviews
 * @property createdAt - ISO timestamp of creation
 * @property updatedAt - ISO timestamp of last update
 * @property subscriptionId - Stripe subscription ID
 * @property phone - Contact phone number
 * @property email - Contact email address
 * @property isVerified - Official verification status
 * @property isFeatured - Featured listing status
 * @property moderationStatus - Content moderation state
 * @property slug - URL-friendly identifier
 */
export interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  coordinates?: Coordinates;
  logo?: string;
  highlights: string[];
  amenities: string[];
  treatmentTypes: string[];
  substances: string[];
  insurance: string[];
  accreditation: string[];
  languages: string[];
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
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  slug: string;
}

/**
 * Create User Data Interface
 * Used when creating new user accounts
 * Contains initial user data requirements
 * 
 * @property email - User's email address
 * @property role - Initial user role
 * @property createdAt - ISO timestamp of creation
 */
export interface CreateUserData {
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

/**
 * Facility With Contact Interface
 * Extends Facility to require phone number
 * Used in contexts where contact info is mandatory
 * 
 * @extends Facility
 * @property phone - Required contact phone number
 */
export interface FacilityWithContact extends Facility {
  phone: string;
}

/**
 * Search Filters State Interface
 * Represents active search/filter criteria
 * Used for facility search and filtering
 * 
 * @property treatmentTypes - Selected treatment types
 * @property amenities - Selected amenities
 * @property insurance - Selected insurance providers
 * @property rating - Minimum rating filter
 * @property priceRange - Price range filter [min, max]
 */
export interface SearchFiltersState {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}

/**
 * Collection Types
 * Available collection types in the system
 */
export type CollectionType = 
  | 'highlights'
  | 'amenities'
  | 'treatmentTypes'
  | 'substances'
  | 'insurance'
  | 'accreditation'
  | 'languages';
