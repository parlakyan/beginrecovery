export interface User {
  id: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
  isSuspended?: boolean;
  lastLogin?: string;
  verifiedListings?: number;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  city?: string;
  state?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities: string[];
  images: string[];
  status: 'pending' | 'active' | 'suspended';
  ownerId: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  subscriptionId?: string;
  phone: string;
  email: string;
  tags: string[];
  highlights: string[];
  substances: string[];
  insurance: string[];
  accreditation: string[];
  languages: string[];
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
  slug: string;
  logo?: string;
}

export interface FeaturedLocation {
  id: string;
  city: string;
  state: string;
  image: string;
  totalListings: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface UserStats {
  totalListings: number;
  verifiedListings: number;
  lastLogin: string;
  joinDate: string;
  status: 'active' | 'suspended';
}

export interface SearchFiltersState {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: number | null;
}

export type CollectionType = 
  | 'highlights'
  | 'treatmentTypes'
  | 'substances'
  | 'amenities'
  | 'insurance'
  | 'accreditation'
  | 'languages';
