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
import { Amenity } from '../types';

const COLLECTION = 'amenities';

export const amenitiesService = {
  async getAmenities(): Promise<Amenity[]> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const q = query(collectionRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as Amenity[];
    } catch (error) {
      console.error('Error getting amenities:', error);
      return [];
    }
  },

  async getAmenityById(id: string): Promise<Amenity | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Amenity;
    } catch (error) {
      console.error('Error getting amenity:', error);
      return null;
    }
  },

  async addAmenity(data: Omit<Amenity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Amenity | null> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return await this.getAmenityById(docRef.id);
    } catch (error) {
      console.error('Error adding amenity:', error);
      return null;
    }
  },

  async updateAmenity(id: string, data: Partial<Amenity>): Promise<Amenity | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return await this.getAmenityById(id);
    } catch (error) {
      console.error('Error updating amenity:', error);
      return null;
    }
  },

  async deleteAmenity(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting amenity:', error);
      return false;
    }
  }
};
