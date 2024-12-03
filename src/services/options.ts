import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';

// Collection names
const TREATMENT_OPTIONS_COLLECTION = 'treatmentOptions';
const AMENITY_OPTIONS_COLLECTION = 'amenityOptions';
const INSURANCE_OPTIONS_COLLECTION = 'insuranceOptions';

/**
 * Service for managing facility options (treatments, amenities, insurance)
 */
export const optionsService = {
  /**
   * Get all treatment type options
   */
  async getTreatmentOptions() {
    try {
      console.log('Fetching treatment options');
      const optionsRef = collection(db, TREATMENT_OPTIONS_COLLECTION);
      const q = query(optionsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().name as string);
    } catch (error) {
      console.error('Error getting treatment options:', error);
      return [];
    }
  },

  /**
   * Get all amenity options
   */
  async getAmenityOptions() {
    try {
      console.log('Fetching amenity options');
      const optionsRef = collection(db, AMENITY_OPTIONS_COLLECTION);
      const q = query(optionsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().name as string);
    } catch (error) {
      console.error('Error getting amenity options:', error);
      return [];
    }
  },

  /**
   * Get all insurance options
   */
  async getInsuranceOptions() {
    try {
      console.log('Fetching insurance options');
      const optionsRef = collection(db, INSURANCE_OPTIONS_COLLECTION);
      const q = query(optionsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().name as string);
    } catch (error) {
      console.error('Error getting insurance options:', error);
      return [];
    }
  },

  /**
   * Filter options based on input
   */
  filterOptions(options: string[], input: string): string[] {
    const lowerInput = input.toLowerCase().trim();
    return options.filter(option => 
      option.toLowerCase().includes(lowerInput)
    );
  }
};
