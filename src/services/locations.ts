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
import { FeaturedLocation, CityInfo } from '../types';

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
    order: data.order || 0,
    isFeatured: Boolean(data.isFeatured)
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
        where('isFeatured', '==', true),
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
        isFeatured: true,
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

  async getAllCities(): Promise<CityInfo[]> {
    try {
      console.log('Fetching all cities with listings');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const locationsRef = collection(db, LOCATIONS_COLLECTION);
      
      // Get all approved facilities
      const facilitiesQuery = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );
      
      // Get all featured locations
      const locationsQuery = query(locationsRef);
      
      const [facilitiesSnapshot, locationsSnapshot] = await Promise.all([
        getDocs(facilitiesQuery),
        getDocs(locationsQuery)
      ]);
      
      // Create map of featured locations with full data
      const featuredLocations = new Map<string, { id: string; isFeatured: boolean; image?: string }>();
      locationsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const key = `${data.city}, ${data.state}`;
        featuredLocations.set(key, {
          id: doc.id,
          isFeatured: Boolean(data.isFeatured),
          image: data.image || undefined
        });
      });
      
      // Extract unique cities and count listings
      const cityMap = new Map<string, CityInfo>();
      
      facilitiesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.city && data.state) {
          const key = `${data.city}, ${data.state}`;
          const existing = cityMap.get(key);
          const featuredData = featuredLocations.get(key);
          
          if (existing) {
            existing.totalListings++;
          } else {
            cityMap.set(key, {
              id: featuredData?.id,
              city: data.city,
              state: data.state,
              totalListings: 1,
              coordinates: data.coordinates,
              isFeatured: featuredData?.isFeatured || false,
              image: featuredData?.image
            });
          }
        }
      });

      // Convert to array and sort by listing count
      const cities = Array.from(cityMap.values())
        .sort((a, b) => b.totalListings - a.totalListings);

      console.log('Fetched cities:', cities.length);
      return cities;
    } catch (error) {
      console.error('Error getting cities:', error);
      return [];
    }
  },

  async toggleLocationFeatured(city: string, state: string, isFeatured: boolean) {
    try {
      console.log('Toggling location featured status:', { city, state, isFeatured });
      const locationsRef = collection(db, LOCATIONS_COLLECTION);
      
      // Check if location already exists
      const q = query(
        locationsRef,
        where('city', '==', city),
        where('state', '==', state)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        // Create new location if it doesn't exist
        if (isFeatured) {
          await this.addFeaturedLocation({
            city,
            state,
            image: '',
            totalListings: 0,
            isFeatured: true
          });
        }
      } else {
        // Update existing location
        const locationDoc = snapshot.docs[0];
        await updateDoc(locationDoc.ref, {
          isFeatured,
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('Toggled location featured status successfully');
    } catch (error) {
      console.error('Error toggling location featured status:', error);
      throw error;
    }
  }
};
