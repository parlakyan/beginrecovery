import { useState, useCallback } from 'react';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';

interface SearchFilters {
  location?: string;
  treatment?: string[];
  insurance?: string[];
}

export const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Facility[]>([]);

  const search = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // For now, just get all facilities and filter client-side
      const { facilities } = await facilitiesService.getFacilities();
      
      // Apply filters
      const filtered = facilities.filter(facility => {
        if (filters.location && !facility.location.toLowerCase().includes(filters.location.toLowerCase())) {
          return false;
        }
        // Add more filter logic here as needed
        return true;
      });

      setResults(filtered);
    } catch (err) {
      console.error('Search error:', err);
      setError('Error searching facilities');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    results,
    search
  };
};
