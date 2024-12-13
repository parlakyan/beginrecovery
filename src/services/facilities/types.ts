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
  treatmentTypes?: string[];
  amenities?: string[];
  insurance?: string[];
  conditions?: string[];
  substances?: string[];
  therapies?: string[];
  languages?: string[];
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

export interface FacilitiesService {
  // CRUD Operations
  createFacility: (data: Partial<Facility>) => Promise<CreateFacilityResponse>;
  getFacilities: () => Promise<FacilitiesResponse>;
  getFacilityById: (id: string) => Promise<Facility | null>;
  getFacilityBySlug: (slug: string) => Promise<Facility | null>;
  updateFacility: (id: string, data: Partial<Facility>) => Promise<Facility>;
  deleteFacility: (id: string) => Promise<void>;

  // Search Operations
  searchFacilities: (params: SearchParams) => Promise<Facility[]>;
  getFeaturedFacilities: () => Promise<Facility[]>;
  getUserListings: (userId: string) => Promise<Facility[]>;

  // Moderation Operations
  getAllListingsForAdmin: () => Promise<Facility[]>;
  getArchivedListings: () => Promise<Facility[]>;
  approveFacility: (id: string) => Promise<Facility>;
  rejectFacility: (id: string) => Promise<Facility>;
  archiveFacility: (id: string) => Promise<Facility>;
  restoreFacility: (id: string) => Promise<Facility>;
  revertToPending: (id: string) => Promise<Facility>;

  // Verification Operations
  verifyFacility: (id: string) => Promise<Facility>;
  unverifyFacility: (id: string) => Promise<Facility>;
  featureFacility: (id: string) => Promise<Facility>;
  unfeatureFacility: (id: string) => Promise<Facility>;

  // Migration Operations
  migrateExistingSlugs: () => Promise<void>;
}

export const FACILITIES_COLLECTION = 'facilities';
export const USERS_COLLECTION = 'users';
export const BATCH_SIZE = 10;
