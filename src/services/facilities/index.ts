import { facilitiesCrud } from './crud';
import { facilitiesSearch } from './search';
import { facilitiesModeration } from './moderation';
import { facilitiesVerification } from './verification';

/**
 * Facilities Service
 * Provides a unified interface for all facility-related operations
 */
export const facilitiesService = {
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

  // Verification Operations
  verifyFacility: facilitiesVerification.verifyFacility,
  unverifyFacility: facilitiesVerification.unverifyFacility,
  featureFacility: facilitiesVerification.featureFacility,
  unfeatureFacility: facilitiesVerification.unfeatureFacility
};

// Export types
export * from './types';

// Export utility functions if needed externally
export { generateSlug, transformFacilityData } from './utils';
