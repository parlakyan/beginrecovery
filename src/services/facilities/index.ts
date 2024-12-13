import { facilitiesCrud } from './crud';
import { facilitiesSearch } from './search';
import { facilitiesModeration } from './moderation';
import { facilitiesVerification } from './verification';
import { Facility } from '../../types';
import { FacilitiesService, FacilitiesResponse, CreateFacilityResponse, SearchParams } from './types';
import { generateSlug, transformFacilityData, migrateExistingSlugs } from './utils';

/**
 * Facilities Service
 * Provides a unified interface for all facility-related operations
 */
export const facilitiesService: FacilitiesService = {
  // CRUD Operations
  createFacility: facilitiesCrud.createFacility,
  getFacilities: facilitiesCrud.getFacilities,
  getFacilityById: facilitiesCrud.getFacilityById,
  getFacilityBySlug: facilitiesCrud.getFacilityBySlug,
  updateFacility: facilitiesCrud.updateFacility,
  deleteFacility: facilitiesCrud.deleteFacility,

  // Search Operations
  searchFacilities: facilitiesSearch.searchFacilities,
  getFeaturedFacilities: facilitiesSearch.getFeaturedFacilities,
  getUserListings: facilitiesSearch.getUserListings,

  // Moderation Operations
  getAllListingsForAdmin: facilitiesModeration.getAllListingsForAdmin,
  getArchivedListings: facilitiesModeration.getArchivedListings,
  approveFacility: facilitiesModeration.approveFacility,
  rejectFacility: facilitiesModeration.rejectFacility,
  archiveFacility: facilitiesModeration.archiveFacility,
  restoreFacility: facilitiesModeration.restoreFacility,
  revertToPending: facilitiesModeration.revertToPending,

  // Verification Operations
  verifyFacility: facilitiesVerification.verifyFacility,
  unverifyFacility: facilitiesVerification.unverifyFacility,
  featureFacility: facilitiesVerification.featureFacility,
  unfeatureFacility: facilitiesVerification.unfeatureFacility,

  // Migration Operations
  migrateExistingSlugs
};

// Export types
export * from './types';

// Export utility functions if needed externally
export { generateSlug, transformFacilityData, migrateExistingSlugs };
