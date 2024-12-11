import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Facility } from '../../types';

export interface SearchParams {
  query?: string;
  location?: string[];
  treatmentTypes?: string[];
  amenities?: string[];
  conditions?: string[];
  substances?: string[];
  therapies?: string[];
  insurances?: string[];
  languages?: string[];
  licenses?: string[];
  rating?: number | null;
}

export const searchFacilities = async (params: SearchParams): Promise<Facility[]> => {
  try {
    const facilitiesRef = collection(db, 'facilities');
    let q = query(facilitiesRef);

    // Base query - exclude pending/rejected/archived facilities
    q = query(q, where('moderationStatus', '==', 'approved'));

    // Add search filters
    if (params.location && params.location.length > 0) {
      // Location search (city or state)
      const locationTerms = params.location.map(loc => loc.toLowerCase());
      q = query(q, where('searchableLocation', 'array-contains-any', locationTerms));
    }

    if (params.treatmentTypes && params.treatmentTypes.length > 0) {
      q = query(q, where('treatmentTypeIds', 'array-contains-any', params.treatmentTypes));
    }

    if (params.conditions && params.conditions.length > 0) {
      q = query(q, where('conditionIds', 'array-contains-any', params.conditions));
    }

    if (params.substances && params.substances.length > 0) {
      q = query(q, where('substanceIds', 'array-contains-any', params.substances));
    }

    if (params.therapies && params.therapies.length > 0) {
      q = query(q, where('therapyIds', 'array-contains-any', params.therapies));
    }

    if (params.amenities && params.amenities.length > 0) {
      q = query(q, where('amenityIds', 'array-contains-any', params.amenities));
    }

    if (params.insurances && params.insurances.length > 0) {
      q = query(q, where('insuranceIds', 'array-contains-any', params.insurances));
    }

    if (params.languages && params.languages.length > 0) {
      q = query(q, where('languageIds', 'array-contains-any', params.languages));
    }

    if (params.licenses && params.licenses.length > 0) {
      q = query(q, where('licenseIds', 'array-contains-any', params.licenses));
    }

    if (params.rating) {
      q = query(q, where('rating', '>=', params.rating));
    }

    // Add ordering
    q = query(q, orderBy('isVerified', 'desc')); // Verified facilities first
    q = query(q, orderBy('rating', 'desc')); // Higher rated facilities first
    q = query(q, orderBy('reviewCount', 'desc')); // More reviewed facilities first

    // Execute query
    const snapshot = await getDocs(q);
    const facilities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Facility[];

    // If there's a text query, filter results client-side
    if (params.query) {
      const searchTerms = params.query.toLowerCase().split(' ');
      return facilities.filter(facility => {
        const searchableText = [
          facility.name,
          facility.description,
          facility.city,
          facility.state,
          ...facility.treatmentTypes.map(t => t.name),
          ...facility.amenities,
          ...facility.substances,
          ...facility.languages,
          ...(facility.conditions?.map(c => c.name) || []),
          ...(facility.therapies?.map(t => t.name) || []),
          ...(facility.insurances?.map(i => i.name) || []),
          ...(facility.licenses?.map(l => l.name) || [])
        ].join(' ').toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    return facilities;
  } catch (error) {
    console.error('Error searching facilities:', error);
    return [];
  }
};
