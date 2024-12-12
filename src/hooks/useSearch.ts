import { useState, useEffect } from 'react';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import { SearchParams } from '../services/facilities/types';

export function useSearch(query: string, filters: Partial<Omit<SearchParams, 'query'>>) {
  const [results, setResults] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchFacilities = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const facilities = await facilitiesService.searchFacilities({
          query,
          treatmentTypes: filters.treatmentTypes || [],
          amenities: filters.amenities || [],
          insurance: filters.insurance || [],
          conditions: filters.conditions || [],
          substances: filters.substances || [],
          therapies: filters.therapies || [],
          location: filters.location,
          rating: filters.rating || null
        });
        
        setResults(facilities);
      } catch (err) {
        console.error('Error searching facilities:', err);
        setError('Failed to fetch results');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchFacilities, 300);
    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  return { results, loading, error };
}
