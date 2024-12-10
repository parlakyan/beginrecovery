import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Facility } from '../../types';
import { FACILITIES_COLLECTION } from './types';
import { transformFacilityData } from './utils';

/**
 * Moderation operations for facilities
 */
export const facilitiesModeration = {
  async getAllListingsForAdmin() {
    try {
      console.log('Fetching all listings for admin');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Get all facilities ordered by creation date
      const q = query(
        facilitiesRef,
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing admin listings query');
      const snapshot = await getDocs(q);
      console.log('Total documents:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed facilities:', facilities.length);

      return facilities;
    } catch (error) {
      console.error('Error getting admin listings:', error);
      return [];
    }
  },

  async getArchivedListings() {
    try {
      console.log('Fetching archived listings');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'archived'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      console.log('Archived documents:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed archived facilities:', facilities.length);

      return facilities;
    } catch (error) {
      console.error('Error getting archived listings:', error);
      return [];
    }
  },

  async approveFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'approved',
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error approving facility:', error);
      throw error;
    }
  },

  async rejectFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'rejected',
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error rejecting facility:', error);
      throw error;
    }
  },

  async archiveFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'archived',
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error archiving facility:', error);
      throw error;
    }
  },

  async restoreFacility(id: string) {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        moderationStatus: 'pending',
        updatedAt: serverTimestamp()
      });
      
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error restoring facility:', error);
      throw error;
    }
  }
};
