export interface User {
  id: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

export interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
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
  tags: string[];
  isVerified: boolean;
  isFeatured: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived';
}

export interface CreateUserData {
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

export interface FacilityWithContact extends Facility {
  phone: string;
}

export interface SearchFiltersState {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}
