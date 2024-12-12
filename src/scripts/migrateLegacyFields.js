import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  updateDoc, 
  doc 
} from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * This script migrates legacy string arrays to managed objects for amenities and languages.
 * It should be run once to convert existing data, then the legacy fields can be removed.
 */
async function migrateLegacyFields() {
  try {
    console.log('Starting migration of legacy fields...');

    // Get all facilities
    const facilitiesRef = collection(db, 'facilities');
    const snapshot = await getDocs(facilitiesRef);
    console.log(`Found ${snapshot.size} facilities to process`);

    // Get all available managed amenities and languages
    const [amenities, languages] = await Promise.all([
      getDocs(collection(db, 'amenities')),
      getDocs(collection(db, 'languages'))
    ]);

    // Create maps for quick lookups
    const amenityMap = new Map();
    amenities.docs.forEach(doc => {
      const data = doc.data();
      amenityMap.set(data.name.toLowerCase(), {
        id: doc.id,
        ...data
      });
    });

    const languageMap = new Map();
    languages.docs.forEach(doc => {
      const data = doc.data();
      languageMap.set(data.name.toLowerCase(), {
        id: doc.id,
        ...data
      });
    });

    // Process each facility
    const updates = snapshot.docs.map(async (docSnap) => {
      const facilityData = docSnap.data();
      const facilityRef = doc(db, 'facilities', docSnap.id);

      // Convert legacy amenities to managed amenities
      const legacyAmenities = facilityData.amenities || [];
      const existingAmenityObjects = facilityData.amenityObjects || [];
      const newAmenityObjects = [...existingAmenityObjects];

      legacyAmenities.forEach(amenityName => {
        const amenity = amenityMap.get(amenityName.toLowerCase());
        if (amenity && !newAmenityObjects.some(a => a.id === amenity.id)) {
          newAmenityObjects.push(amenity);
        }
      });

      // Convert legacy languages to managed languages
      const legacyLanguages = facilityData.languages || [];
      const existingLanguageObjects = facilityData.languageObjects || [];
      const newLanguageObjects = [...existingLanguageObjects];

      legacyLanguages.forEach(languageName => {
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
}

// Run the migration
migrateLegacyFields()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
