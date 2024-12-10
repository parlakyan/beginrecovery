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
  orderBy,
  limit,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { storageService } from '../storage';
import { Facility } from '../../types';
import { FACILITIES_COLLECTION, BATCH_SIZE } from './types';
import { transformFacilityData, generateSlug } from './utils';

/**
 * Core CRUD operations for facilities
 */
export const facilitiesCrud = {
  async createFacility(data: Partial<Facility>) {
    try {
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const facilityData = {
        ...data,
        ownerId: auth.currentUser?.uid,
        rating: 0,
        reviews: 0,
        reviewCount: 0,
        status: 'pending',
        moderationStatus: 'pending',
        isVerified: false,
        isFeatured: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        slug: generateSlug(data.name || '', data.location || '')
      };

      const docRef = await addDoc(facilitiesRef, facilityData);
      return { id: docRef.id };
    } catch (error) {
      console.error('Error creating facility:', error);
      throw error;
    }
  },

  async getFacilities() {
    try {
      console.log('Fetching facilities');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Create index for compound query
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing facilities query');
      const snapshot = await getDocs(q);
      console.log('Total documents:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed facilities:', facilities.length);

      return { 
        facilities, 
        lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
        hasMore: false
      };
    } catch (error) {
      console.error('Error getting facilities:', error);
      
      // If compound query fails, try simple query
      try {
        console.log('Falling back to simple query');
        const snapshot = await getDocs(collection(db, FACILITIES_COLLECTION));
        
        const facilities = snapshot.docs
          .map(transformFacilityData)
          .filter(f => f.moderationStatus === 'approved')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('Fallback query successful:', facilities.length);
        
        return {
          facilities,
          lastVisible: null,
          hasMore: false
        };
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        return { facilities: [], lastVisible: null, hasMore: false };
      }
    }
  },

  async getFacilityById(id: string) {
    try {
      console.log('Fetching facility by ID:', id);
      const docRef = doc(db, FACILITIES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        console.log('No facility found with ID:', id);
        return null;
      }
      
      const facility = transformFacilityData(docSnap as QueryDocumentSnapshot<DocumentData>);
      console.log('Found facility:', facility);
      return facility;
    } catch (error) {
      console.error('Error getting facility:', error);
      return null;
    }
  },

  async getFacilityBySlug(slug: string) {
    try {
      console.log('Fetching facility by slug:', slug);
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(facilitiesRef, where('slug', '==', slug), limit(1));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        console.log('No facility found with slug:', slug);
        return null;
      }

      const facility = transformFacilityData(snapshot.docs[0]);
      console.log('Found facility with logo:', facility.logo);
      return facility;
    } catch (error) {
      console.error('Error getting facility by slug:', error);
      return null;
    }
  },

  async updateFacility(id: string, data: Partial<Facility>) {
    try {
      console.log('Updating facility:', { id, data });
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      
      // Get current facility data
      const facilityDoc = await getDoc(facilityRef);
      const currentData = facilityDoc.data();

      // Handle logo removal
      if (data.logo === undefined && currentData?.logo) {
        try {
          const url = new URL(currentData.logo);
          const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
          if (path.startsWith('facilities/')) {
            await storageService.deleteFile(path);
          }
        } catch (error) {
          console.error('Error cleaning up old logo:', error);
        }
      }

      // Handle photo removal
      if (data.images && currentData?.images) {
        const removedPhotos = currentData.images.filter((oldUrl: string) => !data.images?.includes(oldUrl));
        if (removedPhotos.length > 0) {
          try {
            const paths = removedPhotos.map((url: string) => {
              const urlObj = new URL(url);
              return decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
            }).filter((path: string) => path.startsWith('facilities/'));
            
            if (paths.length > 0) {
              await storageService.deleteFiles(paths);
            }
          } catch (error) {
            console.error('Error cleaning up old photos:', error);
          }
        }
      }

      // Create a clean update object without undefined values
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

      // Add server timestamp
      cleanData.updatedAt = serverTimestamp();

      // Update slug if name or location changed
      if (data.name || data.location) {
        const name = data.name || currentData?.name;
        const location = data.location || currentData?.location;
        cleanData.slug = generateSlug(name, location);
      }

      await updateDoc(facilityRef, cleanData);
      
      // Fetch and return updated facility
      const updatedDoc = await getDoc(facilityRef);
      return transformFacilityData(updatedDoc as QueryDocumentSnapshot<DocumentData>);
    } catch (error) {
      console.error('Error updating facility:', error);
      throw error;
    }
  },

  async deleteFacility(id: string) {
    try {
      // Get facility data first
      const facilityRef = doc(db, FACILITIES_COLLECTION, id);
      const facilityDoc = await getDoc(facilityRef);
      const facilityData = facilityDoc.data();

      // Clean up storage files
      if (facilityData) {
        try {
          // Clean up logo
          if (facilityData.logo) {
            const logoUrl = new URL(facilityData.logo);
            const logoPath = decodeURIComponent(logoUrl.pathname.split('/o/')[1].split('?')[0]);
            if (logoPath.startsWith('facilities/')) {
              await storageService.deleteFile(logoPath);
            }
          }

          // Clean up photos
          if (facilityData.images?.length > 0) {
            const photoPaths = facilityData.images.map((url: string) => {
              const urlObj = new URL(url);
              return decodeURIComponent(urlObj.pathname.split('/o/')[1].split('?')[0]);
            }).filter((path: string) => path.startsWith('facilities/'));

            if (photoPaths.length > 0) {
              await storageService.deleteFiles(photoPaths);
            }
          }
        } catch (error) {
          console.error('Error cleaning up facility files:', error);
        }
      }

      // Delete the facility document
      await deleteDoc(facilityRef);
    } catch (error) {
      console.error('Error deleting facility:', error);
      throw error;
    }
  }
};
