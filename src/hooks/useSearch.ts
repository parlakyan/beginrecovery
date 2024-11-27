import { useState } from 'react';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';

interface SearchFilters {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}

export function useSearch() {
  const [results, setResults] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async (query: string, filters: SearchFilters) => {
    try {
      setLoading(true);
      setError(null);

      const searchResults = await facilitiesService.searchFacilities({
        query,
        tags: filters.treatmentTypes,
        insurance: filters.insurance,
        rating: filters.rating ?? undefined
      });

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setError('Error performing search');
    } finally {
      setLoading(false);
    }
  };

  return {
    results,
    loading,
    error,
    search
  };
}
