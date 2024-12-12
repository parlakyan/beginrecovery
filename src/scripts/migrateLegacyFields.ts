import { collection, getDocs, updateDoc, doc, DocumentData } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { amenitiesService } from '../services/amenities';
import { languagesService } from '../services/languages';
import { Amenity, Language } from '../types';

interface LegacyFacilityData extends DocumentData {
  amenities?: string[];
  languages?: string[];
  tags?: string[];
  amenityObjects?: Amenity[];
  languageObjects?: Language[];
}

/**
 * This script migrates legacy string arrays to managed objects for amenities and languages.
 * It should be run once to convert existing data, then the legacy fields can be removed.
 */
export const migrateLegacyFields = async () => {
  try {
    console.log('Starting migration of legacy fields...');

    // Get all available managed amenities and languages
    const [allAmenities, allLanguages] = await Promise.all([
      amenitiesService.getAmenities(),
      languagesService.getLanguages()
    ]);

    // Create maps for quick lookups
    const amenityMap = new Map<string, Amenity>();
    allAmenities.forEach(amenity => {
      amenityMap.set(amenity.name.toLowerCase(), amenity);
    });

    const languageMap = new Map<string, Language>();
    allLanguages.forEach(language => {
      languageMap.set(language.name.toLowerCase(), language);
    });

    // Get all facilities
    const facilitiesRef = collection(db, 'facilities');
    const snapshot = await getDocs(facilitiesRef);
    console.log(`Found ${snapshot.size} facilities to process`);

    // Process each facility
    const updates = snapshot.docs.map(async (docSnap) => {
      const facilityData = docSnap.data() as LegacyFacilityData;
      const facilityRef = doc(db, 'facilities', docSnap.id);

      // Convert legacy amenities to managed amenities
      const legacyAmenities = facilityData.amenities || [];
      const existingAmenityObjects = facilityData.amenityObjects || [];
      const newAmenityObjects = [...existingAmenityObjects];

      legacyAmenities.forEach((amenityName: string) => {
        const amenity = amenityMap.get(amenityName.toLowerCase());
        if (amenity && !newAmenityObjects.some(a => a.id === amenity.id)) {
          newAmenityObjects.push(amenity);
        }
      });

      // Convert legacy languages to managed languages
      const legacyLanguages = facilityData.languages || [];
      const existingLanguageObjects = facilityData.languageObjects || [];
      const newLanguageObjects = [...existingLanguageObjects];

      legacyLanguages.forEach((languageName: string) => {
        const language = languageMap.get(languageName.toLowerCase());
        if (language && !newLanguageObjects.some(l => l.id === language.id)) {
          newLanguageObjects.push(language);
        }
      });

      // Update the facility with new data
      const updateData = {
        amenityObjects: newAmenityObjects,
        languageObjects: newLanguageObjects,
        // Remove legacy fields
        amenities: null,
        languages: null,
        // Also remove legacy tags as they're replaced by treatmentTypes
        tags: null
      };

      console.log(`Updating facility ${docSnap.id}:`, {
        oldAmenities: legacyAmenities.length,
        newAmenities: newAmenityObjects.length,
        oldLanguages: legacyLanguages.length,
        newLanguages: newLanguageObjects.length
      });

      return updateDoc(facilityRef, updateData);
    });

    // Wait for all updates to complete
    await Promise.all(updates);
    console.log('Migration completed successfully');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
};

// Create a command to run the migration
if (require.main === module) {
  console.log('Running migration script...');
  migrateLegacyFields()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
