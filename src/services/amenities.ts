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
import { Amenity } from '../types';

const AMENITIES_COLLECTION = 'amenities';

export const amenitiesService = {
  async getAmenities(): Promise<Amenity[]> {
    try {
      const amenitiesRef = collection(db, AMENITIES_COLLECTION);
      const q = query(amenitiesRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as Amenity));
    } catch (error) {
      console.error('Error getting amenities:', error);
      return [];
    }
  },

  async addAmenity(data: Omit<Amenity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Amenity> {
    try {
      const amenitiesRef = collection(db, AMENITIES_COLLECTION);
      const docRef = await addDoc(amenitiesRef, {
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
      } as Amenity;
    } catch (error) {
      console.error('Error adding amenity:', error);
      throw error;
    }
  },

  async updateAmenity(id: string, data: Partial<Amenity>): Promise<void> {
    try {
      const amenityRef = doc(db, AMENITIES_COLLECTION, id);
      await updateDoc(amenityRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating amenity:', error);
      throw error;
    }
  },

  async deleteAmenity(id: string): Promise<void> {
    try {
      const amenityRef = doc(db, AMENITIES_COLLECTION, id);
      await deleteDoc(amenityRef);
    } catch (error) {
      console.error('Error deleting amenity:', error);
      throw error;
    }
  }
};
