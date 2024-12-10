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
  rating: number | null;
}

export const FACILITIES_COLLECTION = 'facilities';
export const USERS_COLLECTION = 'users';
export const BATCH_SIZE = 10;
