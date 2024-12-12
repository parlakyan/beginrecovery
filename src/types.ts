// Previous interfaces remain the same...

export interface Facility {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string;
  location: string;
  city: string;
  state: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  website?: string;
  images: string[];
  logo?: string;
  tags: string[];  // Keep as string[] for backward compatibility
  treatmentTypes?: TreatmentType[];  // New field for managed treatment types
  amenities: string[];  // Keep as string[] for backward compatibility
  amenityObjects?: Amenity[];  // New field for managed amenities
  highlights: string[];
  substances?: Substance[];
  conditions?: Condition[];
  therapies?: Therapy[];
  insurance: string[];
  insurances?: Insurance[];
  accreditation: string[];
  languages: string[];  // Keep as string[] for backward compatibility
  languageObjects?: Language[];  // New field for managed languages
  licenses?: License[];
  rating: number;
  reviews: number;
  reviewCount: number;
  isVerified: boolean;
  isFeatured: boolean;
  subscriptionId?: string;
  moderationStatus?: 'pending' | 'approved' | 'rejected' | 'archived';
  status?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'user' | 'admin' | 'owner';
  facilities?: string[];
  isSuspended?: boolean;
  lastLogin?: string;
  verifiedListings?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface UserStats {
  totalUsers?: number;
  newUsersThisMonth?: number;
  activeUsers?: number;
  totalListings?: number;
  verifiedListings?: number;
  lastLogin?: string;
  status?: string;
  joinDate?: string;
}

export interface FeaturedLocation {
  id: string;
  city: string;
  state: string;
  image: string;
  totalListings: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  order: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CityInfo {
  id?: string;
  city: string;
  state: string;
  totalListings: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  isFeatured: boolean;
  image?: string;
}

export interface SearchFiltersState {
  location: string[];
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  conditions: string[];
  substances: string[];
  therapies: string[];
  rating: number | null;
  priceRange: number | null;
}

export type CollectionType = string;

export interface License {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Insurance {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Substance {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Therapy {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentType {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Language {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}
