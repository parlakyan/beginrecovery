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
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Therapy } from '../types';

const THERAPIES_COLLECTION = 'therapies';

/**
 * Service for managing therapies
 */
export const therapiesService = {
  async getTherapies() {
    try {
      const therapiesRef = collection(db, THERAPIES_COLLECTION);
      const q = query(therapiesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Therapy[];
    } catch (error) {
      console.error('Error getting therapies:', error);
      return [];
    }
  },

  async addTherapy(data: Partial<Therapy>) {
    try {
      const therapiesRef = collection(db, THERAPIES_COLLECTION);
      const docRef = await addDoc(therapiesRef, {
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
      } as Therapy;
    } catch (error) {
      console.error('Error adding therapy:', error);
      throw error;
    }
  },

  async updateTherapy(id: string, data: Partial<Therapy>) {
    try {
      const therapyRef = doc(db, THERAPIES_COLLECTION, id);
      await updateDoc(therapyRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      const updatedDoc = await getDoc(therapyRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Therapy;
    } catch (error) {
      console.error('Error updating therapy:', error);
      throw error;
    }
  },

  async deleteTherapy(id: string) {
    try {
      const therapyRef = doc(db, THERAPIES_COLLECTION, id);
      await deleteDoc(therapyRef);
    } catch (error) {
      console.error('Error deleting therapy:', error);
      throw error;
    }
  }
};
