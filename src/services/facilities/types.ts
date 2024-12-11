import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { Facility } from '../../types';

export interface CreateUserInput {
  email: string;
  role: 'user' | 'owner' | 'admin';
  createdAt: string;
}

export interface SearchParams {
  query: string;
  location?: string[];
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  conditions: string[];
  substances: string[];
  therapies: string[];
  rating: number | null;
}

export interface FacilitiesResponse {
  facilities: Facility[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export interface CreateFacilityResponse {
  id: string;
}

export const FACILITIES_COLLECTION = 'facilities';
export const USERS_COLLECTION = 'users';
export const BATCH_SIZE = 10;
