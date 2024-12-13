/**
 * Import job status
 */
export type ImportStatus = 
  | 'pending'      // Initial CSV upload
  | 'importing'    // Basic data import in progress
  | 'geocoding'    // Address processing in progress
  | 'completed'    // All processing done
  | 'failed';      // Error occurred

/**
 * Address match quality
 */
export type AddressMatchQuality = 
  | 'exact'        // Perfect match
  | 'partial'      // Some components matched
  | 'none'         // No match found
  | 'pending';     // Not yet processed

/**
 * Import job statistics
 */
export interface ImportStats {
  totalFacilities: number;
  processedFacilities: number;
  failedFacilities: number;
  geocodedAddresses: number;
  partialMatches: number;
  failedGeocoding: number;
  startedAt: string;
  completedAt?: string;
}

/**
 * Import job record
 */
export interface ImportJob {
  id: string;
  fileName: string;
  status: ImportStatus;
  stats: ImportStats;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  error?: string;
}

/**
 * Facility import record
 */
export interface ImportedFacility {
  importJobId: string;
  facilityId: string;
  name: string;
  website: string;
  rawAddress: string;
  addressMatchQuality: AddressMatchQuality;
  geocodingError?: string;
  needsReview: boolean;
  processedAt?: string;
}

/**
 * CSV row format
 */
export interface FacilityCSVRow {
  'Facility Name': string;
  'Facility Website': string;
  'Facility Address': string;
}

/**
 * Progress update event
 */
export interface ImportProgress {
  jobId: string;
  status: ImportStatus;
  stats: ImportStats;
  currentOperation?: string;
}

/**
 * Import job creation options
 */
export interface CreateImportJobOptions {
  fileName: string;
  userId: string;
  totalFacilities: number;
}

/**
 * Collections
 */
export const IMPORT_JOBS_COLLECTION = 'import_jobs';
export const IMPORTED_FACILITIES_COLLECTION = 'imported_facilities';
