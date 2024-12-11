import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Facility } from '../../types';
import { facilitiesUtils } from './utils';

const FACILITIES_COLLECTION = 'facilities';

export const facilitiesCrud = {
  async getFacilities(): Promise<Facility[]> {
    try {
      const q = query(
        collection(db, FACILITIES_COLLECTION),
        where('moderationStatus', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...facilitiesUtils.transformFacilityData(doc.data())
      } as Facility));
    } catch (error) {
      console.error('Error getting facilities:', error);
      return [];
    }
  },

  async getFacilityById(id: string): Promise<Facility | null> {
    try {
      const docRef = doc(db, FACILITIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...facilitiesUtils.transformFacilityData(docSnap.data())
      } as Facility;
    } catch (error) {
      console.error('Error getting facility:', error);
      return null;
    }
  },

  async getFacilityBySlug(slug: string): Promise<Facility | null> {
    try {
      const q = query(
        collection(db, FACILITIES_COLLECTION),
        where('slug', '==', slug),
        limit(1)
      );
      
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return {
        id: doc.id,
        ...facilitiesUtils.transformFacilityData(doc.data())
      } as Facility;
    } catch (error) {
      console.error('Error getting facility by slug:', error);
      return null;
    }
  },

  async getFeaturedFacilities(): Promise<Facility[]> {
    try {
      const q = query(
        collection(db, FACILITIES_COLLECTION),
        where('isFeatured', '==', true),
        where('moderationStatus', '==', 'approved'),
        orderBy('rating', 'desc'),
        limit(6)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...facilitiesUtils.transformFacilityData(doc.data())
      } as Facility));
    } catch (error) {
      console.error('Error getting featured facilities:', error);
      return [];
    }
  },

  async createFacility(data: Partial<Facility>): Promise<Facility> {
    try {
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const docRef = await addDoc(facilitiesRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newDoc = await getDoc(docRef);
      return {
        id: docRef.id,
        ...facilitiesUtils.transformFacilityData(newDoc.data())
      } as Facility;
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  },

  async updateFacility(id: string, data: Partial<Facility>): Promise<Facility> {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await updateDoc(facilityRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      const updatedDoc = await getDoc(facilityRef);
      return {
        id: updatedDoc.id,
        ...facilitiesUtils.transformFacilityData(updatedDoc.data())
      } as Facility;
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  },

  async deleteFacility(id: string): Promise<void> {
    try {
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      await deleteDoc(facilityRef);
    } catch (error) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  }
};
