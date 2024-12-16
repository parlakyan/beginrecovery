import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FACILITIES_COLLECTION } from './types';
import { transformFacilityData } from './utils';

/**
 * Verification operations for facilities
 * Handles paid/verified status and related features
 */
export const facilitiesVerification = {
  async verifyFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isVerified: true,
        moderationStatus: 'approved', // Auto-approve verified facilities
        updatedAt: serverTimestamp()
      });
      
      // Fetch and return updated facility
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error verifying facility:', error);
      throw error;
    }
  },

  async unverifyFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isVerified: false,
        moderationStatus: 'pending', // Reset to pending when unverified
        updatedAt: serverTimestamp()
      });
      
      // Fetch and return updated facility
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error unverifying facility:', error);
      throw error;
    }
  },

  async featureFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isFeatured: true,
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error featuring facility:', error);
      throw error;
    }
  },

  async unfeatureFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        isFeatured: false,
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error unfeaturing facility:', error);
      throw error;
    }
  }
};
