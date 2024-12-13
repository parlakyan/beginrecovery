import { Timestamp } from 'firebase/firestore';

export type ImportStatus = 
  | 'pending'
  | 'importing'
  | 'geocoding'
  | 'completed'
  | 'failed';

export type AddressMatchQuality = 
  | 'pending'
  | 'exact'
  | 'partial'
  | 'none';

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

export interface ImportedFacility {
  importJobId: string;
  facilityId: string;
  name: string;
  website?: string;
  rawAddress: string;
  addressMatchQuality: AddressMatchQuality;
  needsReview: boolean;
  geocodingError?: string;
  processedAt?: string | Timestamp;
}

export interface FacilityCSVRow {
  'Facility Name': string;
  'Facility Website'?: string;
  'Facility Address': string;
}

export interface CreateImportJobOptions {
  fileName: string;
  userId: string;
  totalFacilities: number;
}

export const IMPORT_JOBS_COLLECTION = 'import_jobs';
export const IMPORTED_FACILITIES_COLLECTION = 'imported_facilities';
