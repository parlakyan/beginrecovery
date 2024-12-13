import { facilitiesCrud } from './crud';
import { facilitiesSearch } from './search';
import { facilitiesModeration } from './moderation';
import { facilitiesVerification } from './verification';
import { Facility } from '../../types';
import { FacilitiesResponse, CreateFacilityResponse, SearchParams } from './types';
import { generateSlug, transformFacilityData, migrateExistingSlugs } from './utils';

/**
 * Facilities Service
 * Provides a unified interface for all facility-related operations
 */
export const facilitiesService = {
  // CRUD Operations
  createFacility: facilitiesCrud.createFacility as (data: Partial<Facility>) => Promise<CreateFacilityResponse>,
  getFacilities: facilitiesCrud.getFacilities as () => Promise<FacilitiesResponse>,
  getFacilityById: facilitiesCrud.getFacilityById as (id: string) => Promise<Facility | null>,
  getFacilityBySlug: facilitiesCrud.getFacilityBySlug as (slug: string) => Promise<Facility | null>,
  updateFacility: facilitiesCrud.updateFacility as (id: string, data: Partial<Facility>) => Promise<Facility>,
  deleteFacility: facilitiesCrud.deleteFacility as (id: string) => Promise<void>,

  // Search Operations
  searchFacilities: facilitiesSearch.searchFacilities as (params: SearchParams) => Promise<Facility[]>,
  getFeaturedFacilities: facilitiesSearch.getFeaturedFacilities as () => Promise<Facility[]>,
  getUserListings: facilitiesSearch.getUserListings as (userId: string) => Promise<Facility[]>,

  // Moderation Operations
  getAllListingsForAdmin: facilitiesModeration.getAllListingsForAdmin as () => Promise<Facility[]>,
  getArchivedListings: facilitiesModeration.getArchivedListings as () => Promise<Facility[]>,
  approveFacility: facilitiesModeration.approveFacility as (id: string) => Promise<Facility>,
  rejectFacility: facilitiesModeration.rejectFacility as (id: string) => Promise<Facility>,
  archiveFacility: facilitiesModeration.archiveFacility as (id: string) => Promise<Facility>,
  restoreFacility: facilitiesModeration.restoreFacility as (id: string) => Promise<Facility>,
  revertToPending: facilitiesModeration.revertToPending as (id: string) => Promise<Facility>,

  // Verification Operations
  verifyFacility: facilitiesVerification.verifyFacility as (id: string) => Promise<Facility>,
  unverifyFacility: facilitiesVerification.unverifyFacility as (id: string) => Promise<Facility>,
  featureFacility: facilitiesVerification.featureFacility as (id: string) => Promise<Facility>,
  unfeatureFacility: facilitiesVerification.unfeatureFacility as (id: string) => Promise<Facility>,

  // Migration Operations
  migrateExistingSlugs
} as const;

// Export types
export * from './types';

// Export utility functions if needed externally
export { generateSlug, transformFacilityData, migrateExistingSlugs };
