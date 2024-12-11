import { facilitiesCrud } from './crud';
import { searchFacilities } from './search';
import { facilitiesModeration } from './moderation';
import { facilitiesVerification } from './verification';
import { facilitiesUtils } from './utils';
import type { SearchParams } from './search';

export type { SearchParams };

export const facilitiesService = {
  // CRUD operations
  getFacilities: facilitiesCrud.getFacilities,
  getFacilityById: facilitiesCrud.getFacilityById,
  getFacilityBySlug: facilitiesCrud.getFacilityBySlug,
  getFeaturedFacilities: facilitiesCrud.getFeaturedFacilities,
  createFacility: facilitiesCrud.createFacility,
  updateFacility: facilitiesCrud.updateFacility,
  deleteFacility: facilitiesCrud.deleteFacility,

  // Search operations
  searchFacilities,

  // Moderation operations
  ...facilitiesModeration,

  // Verification operations
  ...facilitiesVerification,

  // Utility operations
  ...facilitiesUtils
};
