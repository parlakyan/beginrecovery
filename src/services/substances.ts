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
import { Substance } from '../types';

const SUBSTANCES_COLLECTION = 'substances';

/**
 * Service for managing substances
 */
export const substancesService = {
  async getSubstances() {
    try {
      const substancesRef = collection(db, SUBSTANCES_COLLECTION);
      const q = query(substancesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Substance[];
    } catch (error) {
      console.error('Error getting substances:', error);
      return [];
    }
  },

  async addSubstance(data: Partial<Substance>) {
    try {
      const substancesRef = collection(db, SUBSTANCES_COLLECTION);
      const docRef = await addDoc(substancesRef, {
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
      } as Substance;
    } catch (error) {
      console.error('Error adding substance:', error);
      throw error;
    }
  },

  async updateSubstance(id: string, data: Partial<Substance>) {
    try {
      const substanceRef = doc(db, SUBSTANCES_COLLECTION, id);
      await updateDoc(substanceRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      const updatedDoc = await getDoc(substanceRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Substance;
    } catch (error) {
      console.error('Error updating substance:', error);
      throw error;
    }
  },

  async deleteSubstance(id: string) {
    try {
      const substanceRef = doc(db, SUBSTANCES_COLLECTION, id);
      await deleteDoc(substanceRef);
    } catch (error) {
      console.error('Error deleting substance:', error);
      throw error;
    }
  }
};
