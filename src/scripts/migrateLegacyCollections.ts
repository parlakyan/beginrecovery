import { collection, getDocs, doc, setDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Migrate legacy collections and fields to new structure
 */
export async function migrateLegacyCollections() {
  console.log('Starting legacy collections migration...');

  try {
    // 1. Migrate pending_facilities to facilities with moderationStatus
    const pendingSnapshot = await getDocs(collection(db, 'pending_facilities'));
    console.log(`Found ${pendingSnapshot.size} pending facilities to migrate`);

    for (const pendingDoc of pendingSnapshot.docs) {
      const data = pendingDoc.data();
      
      // Create new facility with pending status
      await setDoc(doc(db, 'facilities', pendingDoc.id), {
        ...data,
        moderationStatus: 'pending',
        updatedAt: new Date().toISOString()
      });

      // Delete old pending document
      await deleteDoc(doc(db, 'pending_facilities', pendingDoc.id));
    }

    // 2. Migrate treatmentOptions to treatmentTypes
    const optionsSnapshot = await getDocs(collection(db, 'treatmentOptions'));
    console.log(`Found ${optionsSnapshot.size} treatment options to migrate`);

    for (const optionDoc of optionsSnapshot.docs) {
      const data = optionDoc.data();
      
      // Create new treatment type
      await setDoc(doc(db, 'treatmentTypes', optionDoc.id), {
        name: data.name,
        description: data.description || '',
        logo: data.logo || '',
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Delete old option document
      await deleteDoc(doc(db, 'treatmentOptions', optionDoc.id));
    }

    // 3. Update facilities to use treatmentTypes instead of treatmentOptions
    const facilitiesSnapshot = await getDocs(
      query(collection(db, 'facilities'), 
        where('treatmentOptions', '!=', null)
      )
    );
    console.log(`Found ${facilitiesSnapshot.size} facilities with treatment options to update`);

    for (const facilityDoc of facilitiesSnapshot.docs) {
      const data = facilityDoc.data();
      
      // Update facility to use treatmentTypes
      await setDoc(doc(db, 'facilities', facilityDoc.id), {
        ...data,
        treatmentTypes: data.treatmentOptions || [],
        treatmentOptions: null, // Remove old field
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // 4. Create claims collection if it doesn't exist
    await setDoc(doc(db, 'claims', '_config'), {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    console.log('Legacy collections migration completed successfully');
  } catch (error) {
    console.error('Error during legacy collections migration:', error);
    throw error;
  }
}
