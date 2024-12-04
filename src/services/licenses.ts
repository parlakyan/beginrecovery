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
import { License } from '../types';

const LICENSES_COLLECTION = 'licenses';

export const licensesService = {
  async getLicenses(): Promise<License[]> {
    try {
      const licensesRef = collection(db, LICENSES_COLLECTION);
      const q = query(licensesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as License));
    } catch (error) {
      console.error('Error getting licenses:', error);
      return [];
    }
  },

  async addLicense(data: Omit<License, 'id' | 'createdAt' | 'updatedAt'>): Promise<License> {
    try {
      const licensesRef = collection(db, LICENSES_COLLECTION);
      const docRef = await addDoc(licensesRef, {
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
      } as License;
    } catch (error) {
      console.error('Error adding license:', error);
      throw error;
    }
  },

  async updateLicense(id: string, data: Partial<License>): Promise<void> {
    try {
      const licenseRef = doc(db, LICENSES_COLLECTION, id);
      await updateDoc(licenseRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating license:', error);
      throw error;
    }
  },

  async deleteLicense(id: string): Promise<void> {
    try {
      const licenseRef = doc(db, LICENSES_COLLECTION, id);
      await deleteDoc(licenseRef);
    } catch (error) {
      console.error('Error deleting license:', error);
      throw error;
    }
  }
};
