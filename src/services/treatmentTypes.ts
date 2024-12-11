import { 
  collection, 
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { TreatmentType } from '../types';
import { storageService } from './storage';

const TREATMENT_TYPES_COLLECTION = 'treatmentOptions';

export const treatmentTypesService = {
  async getTreatmentTypes(): Promise<TreatmentType[]> {
    try {
      const treatmentTypesRef = collection(db, TREATMENT_TYPES_COLLECTION);
      const q = query(treatmentTypesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        logo: doc.data().logo || '',  // Provide default empty string for logo
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as TreatmentType));
    } catch (error) {
      console.error('Error getting treatment types:', error);
      return [];
    }
  },

  async addTreatmentType(data: Omit<TreatmentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentType> {
    try {
      const treatmentTypesRef = collection(db, TREATMENT_TYPES_COLLECTION);
      const docRef = await addDoc(treatmentTypesRef, {
        ...data,
        logo: data.logo || '',  // Ensure logo is never undefined
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newDoc = await getDoc(docRef);
      return {
        id: docRef.id,
        ...newDoc.data(),
        logo: newDoc.data()?.logo || '',  // Provide default empty string for logo
        createdAt: newDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: newDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as TreatmentType;
    } catch (error) {
      console.error('Error adding treatment type:', error);
      throw error;
    }
  },

  async updateTreatmentType(id: string, data: Partial<TreatmentType>): Promise<void> {
    try {
      const treatmentTypeRef = doc(db, TREATMENT_TYPES_COLLECTION, id);

      // Handle logo removal
      if (data.logo === undefined) {
        const treatmentDoc = await getDoc(treatmentTypeRef);
        const currentData = treatmentDoc.data();
        if (currentData?.logo) {
          try {
            const url = new URL(currentData.logo);
            const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            if (path.startsWith('treatmentTypes/')) {
              await storageService.deleteFile(path);
            }
          } catch (error) {
            console.error('Error cleaning up old logo:', error);
          }
        }
      }

      await updateDoc(treatmentTypeRef, {
        ...data,
        logo: data.logo || '',  // Ensure logo is never undefined
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating treatment type:', error);
      throw error;
    }
  },

  async deleteTreatmentType(id: string): Promise<void> {
    try {
      const treatmentTypeRef = doc(db, TREATMENT_TYPES_COLLECTION, id);

      // Clean up logo if exists
      const treatmentDoc = await getDoc(treatmentTypeRef);
      const treatmentData = treatmentDoc.data();
      if (treatmentData?.logo) {
        try {
          const url = new URL(treatmentData.logo);
          const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
          if (path.startsWith('treatmentTypes/')) {
            await storageService.deleteFile(path);
          }
        } catch (error) {
          console.error('Error cleaning up logo:', error);
        }
      }

      await deleteDoc(treatmentTypeRef);
    } catch (error) {
      console.error('Error deleting treatment type:', error);
      throw error;
    }
  }
};
