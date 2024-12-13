import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  where,
  limit,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TreatmentType } from '../types';

const COLLECTION = 'treatmentTypes';
const FACILITIES_COLLECTION = 'facilities';

export const treatmentTypesService = {
  async getTreatmentTypes(): Promise<TreatmentType[]> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const q = query(collectionRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as TreatmentType[];
    } catch (error) {
      console.error('Error getting treatment types:', error);
      return [];
    }
  },

  async getTopTreatmentTypes(limit: number = 10): Promise<TreatmentType[]> {
    try {
      // Get all facilities
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const facilitiesQuery = query(facilitiesRef, where('moderationStatus', '==', 'approved'));
      const facilitiesSnapshot = await getDocs(facilitiesQuery);

      // Count treatment type occurrences
      const treatmentTypeCounts = new Map<string, { count: number; type: TreatmentType }>();

      // Process each facility
      for (const facilityDoc of facilitiesSnapshot.docs) {
        const facilityData = facilityDoc.data();
        const treatmentTypes = facilityData.treatmentTypes || [];

        // Count each treatment type
        for (const type of treatmentTypes) {
          const current = treatmentTypeCounts.get(type.id) || { count: 0, type };
          treatmentTypeCounts.set(type.id, {
            count: current.count + 1,
            type: current.type
          });
        }
      }

      // Convert to array and sort by count
      const sortedTypes = Array.from(treatmentTypeCounts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, limit)
        .map(item => item.type);

      return sortedTypes;
    } catch (error) {
      console.error('Error getting top treatment types:', error);
      return [];
    }
  },

  async getTreatmentTypeById(id: string): Promise<TreatmentType | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as TreatmentType;
    } catch (error) {
      console.error('Error getting treatment type:', error);
      return null;
    }
  },

  async createTreatmentType(data: Omit<TreatmentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentType | null> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return await this.getTreatmentTypeById(docRef.id);
    } catch (error) {
      console.error('Error creating treatment type:', error);
      return null;
    }
  },

  async updateTreatmentType(id: string, data: Partial<TreatmentType>): Promise<TreatmentType | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return await this.getTreatmentTypeById(id);
    } catch (error) {
      console.error('Error updating treatment type:', error);
      return null;
    }
  },

  async deleteTreatmentType(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting treatment type:', error);
      return false;
    }
  }
};
