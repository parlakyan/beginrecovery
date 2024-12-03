import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CollectionType } from '../types';

// Collection names mapping
const COLLECTION_NAMES: Record<CollectionType, string> = {
  highlights: 'highlightOptions',
  amenities: 'amenityOptions',
  treatmentTypes: 'treatmentOptions',
  substances: 'substanceOptions',
  insurance: 'insuranceOptions',
  accreditation: 'accreditationOptions',
  languages: 'languageOptions'
};

/**
 * Service for managing facility options
 */
export const optionsService = {
  /**
   * Get options for a specific collection
   */
  async getOptions(type: CollectionType) {
    try {
      console.log(`Fetching ${type} options`);
      const optionsRef = collection(db, COLLECTION_NAMES[type]);
      const q = query(optionsRef, orderBy('name'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().name as string);
    } catch (error) {
      console.error(`Error getting ${type} options:`, error);
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
