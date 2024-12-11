import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Condition } from '../types';
import { storageService } from './storage';

const CONDITIONS_COLLECTION = 'conditions';

/**
 * Service for managing conditions
 */
export const conditionsService = {
  async getConditions() {
    try {
      const conditionsRef = collection(db, CONDITIONS_COLLECTION);
      const snapshot = await getDocs(conditionsRef);
      
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
      return { id: docRef.id };
    } catch (error) {
      console.error('Error adding condition:', error);
      throw error;
    }
  },

  async updateCondition(id: string, data: Partial<Condition>) {
    try {
      const conditionRef = doc(db, CONDITIONS_COLLECTION, id);
      
      // Handle logo removal
      if (data.logo === undefined) {
        const conditionDoc = await getDoc(conditionRef);
        const currentData = conditionDoc.data();
        if (currentData?.logo) {
          try {
            const url = new URL(currentData.logo);
            const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            if (path.startsWith('conditions/')) {
              await storageService.deleteFile(path);
            }
          } catch (error) {
            console.error('Error cleaning up old logo:', error);
          }
        }
      }

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
      
      // Clean up logo if exists
      const conditionDoc = await getDoc(conditionRef);
      const conditionData = conditionDoc.data();
      if (conditionData?.logo) {
        try {
          const url = new URL(conditionData.logo);
          const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
          if (path.startsWith('conditions/')) {
            await storageService.deleteFile(path);
          }
        } catch (error) {
          console.error('Error cleaning up logo:', error);
        }
      }

      await deleteDoc(conditionRef);
    } catch (error) {
      console.error('Error deleting condition:', error);
      throw error;
    }
  }
};
