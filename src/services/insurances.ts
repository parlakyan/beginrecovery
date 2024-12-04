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
import { Insurance } from '../types';

const INSURANCES_COLLECTION = 'insurances';

export const insurancesService = {
  async getInsurances(): Promise<Insurance[]> {
    try {
      const insurancesRef = collection(db, INSURANCES_COLLECTION);
      const q = query(insurancesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Insurance));
    } catch (error) {
      console.error('Error getting insurances:', error);
      return [];
    }
  },

  async addInsurance(data: Omit<Insurance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Insurance> {
    try {
      const insurancesRef = collection(db, INSURANCES_COLLECTION);
      const docRef = await addDoc(insurancesRef, {
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
      } as Insurance;
    } catch (error) {
      console.error('Error adding insurance:', error);
      throw error;
    }
  },

  async updateInsurance(id: string, data: Partial<Insurance>): Promise<void> {
    try {
      const insuranceRef = doc(db, INSURANCES_COLLECTION, id);
      await updateDoc(insuranceRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating insurance:', error);
      throw error;
    }
  },

  async deleteInsurance(id: string): Promise<void> {
    try {
      const insuranceRef = doc(db, INSURANCES_COLLECTION, id);
      await deleteDoc(insuranceRef);
    } catch (error) {
      console.error('Error deleting insurance:', error);
      throw error;
    }
  }
};
