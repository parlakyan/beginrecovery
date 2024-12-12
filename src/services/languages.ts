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
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Language } from '../types';

const COLLECTION = 'languages';

export const languagesService = {
  async getLanguages(): Promise<Language[]> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const q = query(collectionRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Language[];
    } catch (error) {
      console.error('Error getting languages:', error);
      return [];
    }
  },

  async getLanguageById(id: string): Promise<Language | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Language;
    } catch (error) {
      console.error('Error getting language:', error);
      return null;
    }
  },

  async addLanguage(data: Omit<Language, 'id' | 'createdAt' | 'updatedAt'>): Promise<Language | null> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return await this.getLanguageById(docRef.id);
    } catch (error) {
      console.error('Error adding language:', error);
      return null;
    }
  },

  async updateLanguage(id: string, data: Partial<Language>): Promise<Language | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return await this.getLanguageById(id);
    } catch (error) {
      console.error('Error updating language:', error);
      return null;
    }
  },

  async deleteLanguage(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting language:', error);
      return false;
    }
  }
};
