import { 
  collection, 
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { FeaturedLocation } from '../types';

const LOCATIONS_COLLECTION = 'featuredLocations';
const FACILITIES_COLLECTION = 'facilities';

/**
 * Transforms Firestore document to FeaturedLocation type
 */
const transformLocationData = (doc: QueryDocumentSnapshot<DocumentData>): FeaturedLocation => {
  const data = doc.data();
  
  const createdAt = data.createdAt instanceof Timestamp 
    ? data.createdAt.toDate().toISOString()
    : new Date().toISOString();
    
  const updatedAt = data.updatedAt instanceof Timestamp
    ? data.updatedAt.toDate().toISOString()
    : new Date().toISOString();

  return {
    id: doc.id,
    city: data.city || '',
    state: data.state || '',
    image: data.image || '',
    totalListings: data.totalListings || 0,
    coordinates: data.coordinates,
    createdAt,
    updatedAt,
    order: data.order || 0
  };
};

/**
 * Featured locations management service
 */
export const locationsService = {
  async getFeaturedLocations() {
    try {
      console.log('Fetching featured locations');
      const locationsRef = collection(db, LOCATIONS_COLLECTION);
      
      const q = query(
        locationsRef,
        orderBy('order', 'asc')
      );
      
      const snapshot = await getDocs(q);
      const locations = snapshot.docs.map(transformLocationData);
      console.log('Fetched featured locations:', locations.length);
      
      return locations;
    } catch (error) {
      console.error('Error getting featured locations:', error);
      return [];
    }
  },

  async addFeaturedLocation(data: Partial<FeaturedLocation>) {
    try {
      console.log('Adding featured location:', data);
      const locationsRef = collection(db, LOCATIONS_COLLECTION);
      
      // Get current max order
      const q = query(locationsRef, orderBy('order', 'desc'), where('order', '>=', 0));
      const snapshot = await getDocs(q);
      const maxOrder = snapshot.empty ? 0 : snapshot.docs[0].data().order + 1;

      const locationData = {
        ...data,
        order: maxOrder,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(locationsRef, locationData);
      console.log('Added featured location:', docRef.id);
      
      const newDoc = await getDoc(docRef);
      return transformLocationData(newDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error adding featured location:', error);
      throw error;
    }
  },

  async updateFeaturedLocation(id: string, data: Partial<FeaturedLocation>) {
    try {
      console.log('Updating featured location:', { id, data });
      const locationRef = doc(db, LOCATIONS_COLLECTION, id);
      
      const updateData = {
        ...data,
        updatedAt: serverTimestamp()
      };

      await updateDoc(locationRef, updateData);
      console.log('Updated featured location:', id);
      
      const updatedDoc = await getDoc(locationRef);
      return transformLocationData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error updating featured location:', error);
      throw error;
    }
  },

  async deleteFeaturedLocation(id: string) {
    try {
      console.log('Deleting featured location:', id);
      const locationRef = doc(db, LOCATIONS_COLLECTION, id);
      await deleteDoc(locationRef);
      console.log('Deleted featured location:', id);
    } catch (error) {
      console.error('Error deleting featured location:', error);
      throw error;
    }
  },

  async reorderFeaturedLocations(orderedIds: string[]) {
    try {
      console.log('Reordering featured locations:', orderedIds);
      const batch = writeBatch(db);
      
      orderedIds.forEach((id, index) => {
        const locationRef = doc(db, LOCATIONS_COLLECTION, id);
        batch.update(locationRef, { 
          order: index,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log('Reordered featured locations');
    } catch (error) {
      console.error('Error reordering featured locations:', error);
      throw error;
    }
  },

  async getAllCities() {
    try {
      console.log('Fetching all cities with listings');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );
      
      const snapshot = await getDocs(q);
      
      // Extract unique cities and count listings
      const cityMap = new Map<string, { city: string; state: string; count: number }>();
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        let city = data.city;
        let state = data.state;
        
        // If city/state not available, try to extract from location
        if (!city || !state) {
          const location = data.location || '';
          const parts = location.split(',').map((part: string) => part.trim());
          if (parts.length >= 2) {
            city = city || parts[0];
            state = state || parts[1];
          }
        }
        
        if (city && state) {
          const key = `${city}, ${state}`;
          const existing = cityMap.get(key);
          
          if (existing) {
            existing.count++;
          } else {
            cityMap.set(key, { city, state, count: 1 });
          }
        }
      });

      // Convert to array and sort by count
      const cities = Array.from(cityMap.values())
        .sort((a, b) => b.count - a.count);

      console.log('Fetched cities:', cities.length);
      return cities;
    } catch (error) {
      console.error('Error getting cities:', error);
      return [];
    }
  }
};
