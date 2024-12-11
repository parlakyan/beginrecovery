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
import { Therapy } from '../types';
import { storageService } from './storage';

const THERAPIES_COLLECTION = 'therapies';

/**
 * Service for managing therapies
 */
export const therapiesService = {
  async getTherapies() {
    try {
      const therapiesRef = collection(db, THERAPIES_COLLECTION);
      const snapshot = await getDocs(therapiesRef);
      
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
      return { id: docRef.id };
    } catch (error) {
      console.error('Error adding therapy:', error);
      throw error;
    }
  },

  async updateTherapy(id: string, data: Partial<Therapy>) {
    try {
      const therapyRef = doc(db, THERAPIES_COLLECTION, id);
      
      // Handle logo removal
      if (data.logo === undefined) {
        const therapyDoc = await getDoc(therapyRef);
        const currentData = therapyDoc.data();
        if (currentData?.logo) {
          try {
            const url = new URL(currentData.logo);
            const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
            if (path.startsWith('therapies/')) {
              await storageService.deleteFile(path);
            }
          } catch (error) {
            console.error('Error cleaning up old logo:', error);
          }
        }
      }

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
      
      // Clean up logo if exists
      const therapyDoc = await getDoc(therapyRef);
      const therapyData = therapyDoc.data();
      if (therapyData?.logo) {
        try {
          const url = new URL(therapyData.logo);
          const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
          if (path.startsWith('therapies/')) {
            await storageService.deleteFile(path);
          }
        } catch (error) {
          console.error('Error cleaning up logo:', error);
        }
      }

      await deleteDoc(therapyRef);
    } catch (error) {
      console.error('Error deleting therapy:', error);
      throw error;
    }
  }
};
