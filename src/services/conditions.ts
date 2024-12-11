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
import { Condition } from '../types';

const CONDITIONS_COLLECTION = 'conditions';

/**
 * Service for managing conditions
 */
export const conditionsService = {
  async getConditions() {
    try {
      const conditionsRef = collection(db, CONDITIONS_COLLECTION);
      const q = query(conditionsRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Condition[];
    } catch (error) {
      console.error('Error getting conditions:', error);
      return [];
    }
  },

  async addCondition(data: Partial<Condition>) {
    try {
      const conditionsRef = collection(db, CONDITIONS_COLLECTION);
      const docRef = await addDoc(conditionsRef, {
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
      } as Condition;
    } catch (error) {
      console.error('Error adding condition:', error);
      throw error;
    }
  },

  async updateCondition(id: string, data: Partial<Condition>) {
    try {
      const conditionRef = doc(db, CONDITIONS_COLLECTION, id);
      await updateDoc(conditionRef, {
        ...data,
        updatedAt: serverTimestamp()
      });

      const updatedDoc = await getDoc(conditionRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data(),
        createdAt: updatedDoc.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: updatedDoc.data()?.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Condition;
    } catch (error) {
      console.error('Error updating condition:', error);
      throw error;
    }
  },

  async deleteCondition(id: string) {
    try {
      const conditionRef = doc(db, CONDITIONS_COLLECTION, id);
      await deleteDoc(conditionRef);
    } catch (error) {
      console.error('Error deleting condition:', error);
      throw error;
    }
  }
};
