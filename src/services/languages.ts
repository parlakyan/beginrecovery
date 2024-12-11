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
import { Language } from '../types';

const LANGUAGES_COLLECTION = 'languages';

export const languagesService = {
  async getLanguages(): Promise<Language[]> {
    try {
      const languagesRef = collection(db, LANGUAGES_COLLECTION);
      const q = query(languagesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Language));
    } catch (error) {
      console.error('Error getting languages:', error);
      return [];
    }
  },

  async addLanguage(data: Omit<Language, 'id' | 'createdAt' | 'updatedAt'>): Promise<Language> {
    try {
      const languagesRef = collection(db, LANGUAGES_COLLECTION);
      const docRef = await addDoc(languagesRef, {
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
      } as Language;
    } catch (error) {
      console.error('Error adding language:', error);
      throw error;
    }
  },

  async updateLanguage(id: string, data: Partial<Language>): Promise<void> {
    try {
      const languageRef = doc(db, LANGUAGES_COLLECTION, id);
      await updateDoc(languageRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating language:', error);
      throw error;
    }
  },

  async deleteLanguage(id: string): Promise<void> {
    try {
      const languageRef = doc(db, LANGUAGES_COLLECTION, id);
      await deleteDoc(languageRef);
    } catch (error) {
      console.error('Error deleting language:', error);
      throw error;
    }
  }
};
