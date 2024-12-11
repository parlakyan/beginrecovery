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

const TREATMENT_TYPES_COLLECTION = 'treatmentOptions';

export interface TreatmentType {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const treatmentTypesService = {
  async getTreatmentTypes(): Promise<TreatmentType[]> {
    try {
      const treatmentTypesRef = collection(db, TREATMENT_TYPES_COLLECTION);
      const q = query(treatmentTypesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const newDoc = await getDoc(docRef);
      return {
        id: docRef.id,
        ...newDoc.data(),
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
      await updateDoc(treatmentTypeRef, {
        ...data,
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
      await deleteDoc(treatmentTypeRef);
    } catch (error) {
      console.error('Error deleting treatment type:', error);
      throw error;
    }
  }
};
