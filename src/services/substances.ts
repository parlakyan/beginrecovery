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
import { Substance } from '../types';
import { storageService } from './storage';

const SUBSTANCES_COLLECTION = 'substances';

/**
 * Service for managing substances
 */
export const substancesService = {
  async getSubstances() {
    try {
      const substancesRef = collection(db, SUBSTANCES_COLLECTION);
      const snapshot = await getDocs(substancesRef);
      
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
      return { id: docRef.id };
    } catch (error) {
      console.error('Error adding substance:', error);
      throw error;
    }
  },

  async updateSubstance(id: string, data: Partial<Substance>) {
    try {
      const substanceRef = doc(db, SUBSTANCES_COLLECTION, id);
      
      // Handle logo removal
      if (data.logo === undefined) {
        const substanceDoc = await getDoc(substanceRef);
        const currentData = substanceDoc.data();
        if (currentData?.logo) {
          try {
            const url = new URL(currentData.logo);
            const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            if (path.startsWith('substances/')) {
              await storageService.deleteFile(path);
            }
          } catch (error) {
            console.error('Error cleaning up old logo:', error);
          }
        }
      }

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
      
      // Clean up logo if exists
      const substanceDoc = await getDoc(substanceRef);
      const substanceData = substanceDoc.data();
      if (substanceData?.logo) {
        try {
          const url = new URL(substanceData.logo);
          const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
          if (path.startsWith('substances/')) {
            await storageService.deleteFile(path);
          }
        } catch (error) {
          console.error('Error cleaning up logo:', error);
        }
      }

      await deleteDoc(substanceRef);
    } catch (error) {
      console.error('Error deleting substance:', error);
      throw error;
    }
  }
};
