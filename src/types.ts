export interface Facility {
  id: string;
  name: string;
  description: string;
  location: string;
  phone: string;
  images: string[];
  amenities: string[];
  tags: string[];
  rating: number;
  reviewCount: number;
  status: 'pending' | 'active' | 'suspended';
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

export interface SubscriptionResponse {
  sessionId: string;
  url?: string;
}