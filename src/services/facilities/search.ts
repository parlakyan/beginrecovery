import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Facility } from '../../types';
import { FACILITIES_COLLECTION } from './types';
import { transformFacilityData } from './utils';
import { SearchParams } from './types';

/**
 * Search and filtering operations for facilities
 */
export const facilitiesSearch = {
  async searchFacilities({
    query: searchQuery,
    treatmentTypes,
    amenities,
    insurance,
    rating
  }: SearchParams): Promise<Facility[]> {
    try {
      console.log('Searching facilities:', {
        query: searchQuery,
        treatmentTypes,
        amenities,
        insurance,
        rating
      });

      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Start with base query for approved facilities
      let q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );

      // Get all facilities and filter in memory
      const snapshot = await getDocs(q);
      let facilities = snapshot.docs.map(doc => transformFacilityData(doc as QueryDocumentSnapshot<DocumentData>));

      // Apply filters
      facilities = facilities.filter(facility => {
        // Text search across multiple fields
        const searchText = searchQuery.toLowerCase();
        const matchesQuery = !searchQuery || [
          facility.name,
          facility.description,
          facility.location,
          facility.city,
          facility.state,
          facility.email,
          facility.phone,
          ...facility.tags,
          ...facility.highlights,
          ...facility.substances,
          ...facility.insurance,
          ...facility.accreditation,
          ...facility.languages
        ].some(field => 
          field && field.toString().toLowerCase().includes(searchText)
        );

        // Treatment types
        const matchesTreatment = treatmentTypes.length === 0 ||
          treatmentTypes.some(type => facility.tags.includes(type));

        // Amenities
        const matchesAmenities = amenities.length === 0 ||
          amenities.some(amenity => facility.amenities.includes(amenity));

        // Insurance
        const matchesInsurance = insurance.length === 0 ||
          insurance.some(ins => facility.insurance.includes(ins));

        // Rating
        const matchesRating = !rating || facility.rating >= rating;

        return matchesQuery && 
               matchesTreatment && 
               matchesAmenities && 
               matchesInsurance && 
               matchesRating;
      });

      // Sort results by relevance and rating
      facilities.sort((a, b) => {
        // First sort by exact name match
        const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
        const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;

        // Then sort by rating
        if (b.rating !== a.rating) return b.rating - a.rating;

        // Then sort by verification status
        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;

        // Finally sort by name
        return a.name.localeCompare(b.name);
      });

      console.log('Search results:', facilities.length);
      return facilities;
    } catch (error) {
      console.error('Error searching facilities:', error);
      return [];
    }
  },

  async getFeaturedFacilities() {
    try {
      console.log('Fetching featured facilities');
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Create index for compound query
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved'),
        where('isFeatured', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing featured facilities query');
      const snapshot = await getDocs(q);
      console.log('Featured documents:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed featured facilities:', facilities.length);
      
      return facilities;
    } catch (error) {
      console.error('Error getting featured facilities:', error);
      
      // If compound query fails, try simple query
      try {
        console.log('Falling back to simple query');
        const snapshot = await getDocs(collection(db, FACILITIES_COLLECTION));
        
        const facilities = snapshot.docs
          .map(transformFacilityData)
          .filter(f => f.moderationStatus === 'approved' && f.isFeatured)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('Fallback query successful:', facilities.length);
        return facilities;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        return [];
      }
    }
  },

  async getUserListings(userId: string) {
    try {
      console.log('Fetching listings for user:', userId);
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      
      // Create index for compound query
      const q = query(
        facilitiesRef,
        where('ownerId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing user listings query:', {
        userId,
        timestamp: new Date().toISOString()
      });

      const snapshot = await getDocs(q);
      console.log('User listings found:', snapshot.size);
      
      const facilities = snapshot.docs.map(transformFacilityData);
      console.log('Transformed user listings:', facilities.length);
      
      return facilities;
    } catch (error) {
      console.error('Error getting user listings:', error);
      
      // If compound query fails, try simple query
      try {
        console.log('Falling back to simple query for user listings');
        const snapshot = await getDocs(collection(db, FACILITIES_COLLECTION));
        
        const facilities = snapshot.docs
          .map(transformFacilityData)
          .filter(f => f.ownerId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        console.log('Fallback query successful:', facilities.length);
        return facilities;
      } catch (fallbackError) {
        console.error('Fallback query failed:', fallbackError);
        return [];
      }
    }
  }
};