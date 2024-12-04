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
  tags: string[];
  amenities: string[];
  highlights: string[];
  substances: string[];
  insurance: string[];
  accreditation: string[];
  languages: string[];
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
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
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
