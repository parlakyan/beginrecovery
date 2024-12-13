import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { 
  Client, 
  AddressType, 
  GeocodeResult, 
  AddressComponent 
} from '@googlemaps/google-maps-services-js';
import { db } from '../../lib/firebase';
import { Facility } from '../../types';
import { generateSlug } from '../facilities/utils';
import { 
  ImportJob, 
  ImportedFacility, 
  FacilityCSVRow,
  ImportStatus,
  AddressMatchQuality,
  CreateImportJobOptions,
  IMPORT_JOBS_COLLECTION,
  IMPORTED_FACILITIES_COLLECTION
} from './types';

const GEOCODING_BATCH_SIZE = 50;
const GEOCODING_DELAY = 1000; // 1 second between batches

/**
 * Create initial facility data with required fields
 */
function createInitialFacilityData(row: FacilityCSVRow): Omit<Facility, 'id'> {
  const now = new Date().toISOString();
  const emptySlug = generateSlug(row['Facility Name'], '');
  
  const facilityData: Omit<Facility, 'id'> = {
    name: row['Facility Name'],
    ownerId: 'admin',
    slug: emptySlug,
    description: '',
    location: '',
    city: '',
    state: '',
    coordinates: { lat: 0, lng: 0 },
    phone: '',
    email: '',
    website: row['Facility Website'],
    images: [],
    amenityObjects: [],
    highlights: [],
    accreditation: [],
    languageObjects: [],
    rating: 0,
    reviews: 0,
    reviewCount: 0,
    isVerified: false,
    isFeatured: false,
    moderationStatus: 'approved',
    claimStatus: 'unclaimed',
    createdAt: now,
    updatedAt: now
  };

  return facilityData;
}

/**
 * Service for handling facility imports
 */
export const importService = {
  /**
   * Create a new import job
   */
  async createImportJob(options: CreateImportJobOptions): Promise<string> {
    const job: Omit<ImportJob, 'id'> = {
      fileName: options.fileName,
      status: 'pending',
      stats: {
        totalFacilities: options.totalFacilities,
        processedFacilities: 0,
        failedFacilities: 0,
        geocodedAddresses: 0,
        partialMatches: 0,
        failedGeocoding: 0,
        startedAt: new Date().toISOString()
      },
      createdBy: options.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, IMPORT_JOBS_COLLECTION), job);
    return docRef.id;
  },

  /**
   * Get import job by ID
   */
  async getImportJob(jobId: string): Promise<ImportJob | null> {
    const docRef = doc(db, IMPORT_JOBS_COLLECTION, jobId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }

    return {
      id: docSnap.id,
      ...docSnap.data()
    } as ImportJob;
  },

  /**
   * Get all import jobs
   */
  async getImportJobs(): Promise<ImportJob[]> {
    const q = query(
      collection(db, IMPORT_JOBS_COLLECTION),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ImportJob));
  },

  /**
   * Cancel an import job
   */
  async cancelImportJob(jobId: string): Promise<void> {
    const jobRef = doc(db, IMPORT_JOBS_COLLECTION, jobId);
    const jobSnap = await getDoc(jobRef);
    
    if (!jobSnap.exists()) {
      throw new Error('Import job not found');
    }

    const job = jobSnap.data() as ImportJob;
    
    // Only allow canceling jobs that are in progress
    if (job.status !== 'importing' && job.status !== 'geocoding') {
      throw new Error('Can only cancel jobs that are in progress');
    }

    // Update job status to failed
    await updateDoc(jobRef, {
      status: 'failed' as ImportStatus,
      error: 'Import cancelled by user',
      updatedAt: serverTimestamp()
    });

    // Get all pending facilities for this job
    const q = query(
      collection(db, IMPORTED_FACILITIES_COLLECTION),
      where('importJobId', '==', jobId),
      where('addressMatchQuality', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    // Mark all pending facilities as needing review
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, {
        addressMatchQuality: 'none' as AddressMatchQuality,
        needsReview: true,
        geocodingError: 'Import cancelled by user',
        processedAt: serverTimestamp()
      });
    });

    await batch.commit();
  },

  /**
   * Phase 1: Import basic facility data
   */
  async importBasicData(jobId: string, facilities: FacilityCSVRow[]): Promise<void> {
    const batch = writeBatch(db);
    const jobRef = doc(db, IMPORT_JOBS_COLLECTION, jobId);

    try {
      // Update job status
      batch.update(jobRef, {
        status: 'importing' as ImportStatus,
        updatedAt: serverTimestamp()
      });

      // Create facilities and import records
      for (const row of facilities) {
        try {
          // Create facility document reference
          const facilityRef = doc(collection(db, 'facilities'));
          
          // Prepare facility data
          const facilityData = createInitialFacilityData(row);

          // Add facility to batch
          batch.set(facilityRef, facilityData);

          // Create import record
          const importedFacility: ImportedFacility = {
            importJobId: jobId,
            facilityId: facilityRef.id,
            name: row['Facility Name'],
            website: row['Facility Website'],
            rawAddress: row['Facility Address'],
            addressMatchQuality: 'pending',
            needsReview: false
          };

          const importedRef = doc(collection(db, IMPORTED_FACILITIES_COLLECTION));
          batch.set(importedRef, importedFacility);

          // Update job stats
          batch.update(jobRef, {
            'stats.processedFacilities': increment(1),
            updatedAt: serverTimestamp()
          });

        } catch (error) {
          console.error('Error preparing facility:', error);
          batch.update(jobRef, {
            'stats.failedFacilities': increment(1),
            updatedAt: serverTimestamp()
          });
        }
      }

      // Commit batch
      await batch.commit();

      // Update job status
      await updateDoc(jobRef, {
        status: 'geocoding' as ImportStatus,
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error in basic data import:', error);
      await updateDoc(jobRef, {
        status: 'failed' as ImportStatus,
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: serverTimestamp()
      });
      throw error;
    }
  },

  /**
   * Phase 2: Process addresses
   */
  async processAddresses(jobId: string): Promise<void> {
    const apiKey = process.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error('Google Maps API key not configured');
    }

    const googleMaps = new Client({});
    const jobRef = doc(db, IMPORT_JOBS_COLLECTION, jobId);

    try {
      // Get all facilities for this job
      const q = query(
        collection(db, IMPORTED_FACILITIES_COLLECTION),
        where('importJobId', '==', jobId),
        where('addressMatchQuality', '==', 'pending')
      );

      const snapshot = await getDocs(q);
      const facilities = snapshot.docs;

      // Process in batches
      for (let i = 0; i < facilities.length; i += GEOCODING_BATCH_SIZE) {
        const batch = facilities.slice(i, i + GEOCODING_BATCH_SIZE);
        
        await Promise.all(batch.map(async (facilityDoc) => {
          const facility = facilityDoc.data() as ImportedFacility;
          const facilityRef = doc(db, 'facilities', facility.facilityId);

          try {
            // Geocode address with increased timeout
            const response = await googleMaps.geocode({
              params: {
                address: facility.rawAddress,
                key: apiKey,
                region: 'us'
              },
              timeout: 10000 // Increase timeout to 10 seconds
            });

            if (!response.data.results || response.data.results.length === 0) {
              throw new Error('Address not found');
            }

            const result = response.data.results[0];
            const { lat, lng } = result.geometry.location;

            // Determine match quality
            const matchQuality: AddressMatchQuality = 
              result.partial_match ? 'partial' : 'exact';

            // Extract city and state
            let city = '';
            let state = '';
            for (const component of result.address_components) {
              if (component.types.includes(AddressType.locality)) {
                city = component.long_name;
              }
              if (component.types.includes(AddressType.administrative_area_level_1)) {
                state = component.short_name;
              }
            }

            // Update facility with required location fields
            await updateDoc(facilityRef, {
              location: result.formatted_address,
              coordinates: { lat, lng },
              city: city || '',
              state: state || '',
              slug: generateSlug(facility.name, result.formatted_address)
            });

            // Update import record
            await updateDoc(facilityDoc.ref, {
              addressMatchQuality: matchQuality,
              needsReview: matchQuality === 'partial',
              processedAt: serverTimestamp()
            });

            // Update job stats
            await updateDoc(jobRef, {
              'stats.geocodedAddresses': increment(1),
              ...(matchQuality === 'partial' && {
                'stats.partialMatches': increment(1)
              }),
              updatedAt: serverTimestamp()
            });

          } catch (error) {
            console.error('Error geocoding address:', error);
            
            // Update import record
            await updateDoc(facilityDoc.ref, {
              addressMatchQuality: 'none' as AddressMatchQuality,
              needsReview: true,
              geocodingError: error instanceof Error ? error.message : 'Unknown error',
              processedAt: serverTimestamp()
            });

            // Update job stats
            await updateDoc(jobRef, {
              'stats.failedGeocoding': increment(1),
              updatedAt: serverTimestamp()
            });
          }
        }));

        // Delay between batches
        if (i + GEOCODING_BATCH_SIZE < facilities.length) {
          await new Promise(resolve => setTimeout(resolve, GEOCODING_DELAY));
        }
      }

      // Update job status
      await updateDoc(jobRef, {
        status: 'completed' as ImportStatus,
        'stats.completedAt': serverTimestamp(),
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error in address processing:', error);
      await updateDoc(jobRef, {
        status: 'failed' as ImportStatus,
        error: error instanceof Error ? error.message : 'Unknown error',
        updatedAt: serverTimestamp()
      });
      throw error;
    }
  },

  /**
   * Get imported facilities for a job
   */
  async getImportedFacilities(jobId: string): Promise<ImportedFacility[]> {
    const q = query(
      collection(db, IMPORTED_FACILITIES_COLLECTION),
      where('importJobId', '==', jobId)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data()
    } as ImportedFacility));
  },

  /**
   * Get facilities that need review
   */
  async getFacilitiesNeedingReview(): Promise<ImportedFacility[]> {
    const q = query(
      collection(db, IMPORTED_FACILITIES_COLLECTION),
      where('needsReview', '==', true)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data()
    } as ImportedFacility));
  }
};
