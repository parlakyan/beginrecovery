# Search System

This document details the search and filter system implementation in the Recovery Directory.

## Overview

The search system provides:
- Full-text search across all facility fields
- Multi-criteria filtering
- Location-based search with city/state matching
- Collection-based filtering (treatments, amenities, etc.)
- Automatic exclusion of archived facilities
- Sort by relevance, rating, and verification status
- Real-time updates with debouncing

## Implementation

### Search Parameters

```typescript
export interface SearchParams {
  query: string;           // Text search query
  location?: string[];     // Array of "city, state" strings
  treatmentTypes?: string[]; // Treatment type IDs
  amenities?: string[];    // Amenity IDs
  insurance?: string[];    // Insurance IDs
  conditions?: string[];   // Condition IDs
  substances?: string[];   // Substance IDs
  therapies?: string[];    // Therapy IDs
  languages?: string[];    // Language IDs
  rating?: number | null;  // Minimum rating filter
}
```

### Facilities Service Search

The facilities service handles the core search functionality:

```typescript
async searchFacilities(params: SearchParams): Promise<Facility[]> {
  // Get only approved, non-archived facilities
  const facilities = await this.getFacilities();
  const searchLower = params.query.toLowerCase();
  
  return facilities.filter(facility => {
    // Basic search match
    const matchesSearch = searchLower === '' || 
      facility.name.toLowerCase().includes(searchLower) ||
      (facility.location || '').toLowerCase().includes(searchLower) ||
      (facility.city || '').toLowerCase().includes(searchLower) ||
      (facility.state || '').toLowerCase().includes(searchLower);

    // Location match - handle city, state format
    const matchesLocation = !params.location?.length || params.location.some(loc => {
      const [city, state] = loc.split(',').map(s => s.trim().toLowerCase());
      return (facility.city?.toLowerCase() === city && facility.state?.toLowerCase() === state);
    });

    // Collection matches with proper null handling
    const matchesTreatmentTypes = !params.treatmentTypes?.length || 
      facility.treatmentTypes?.some(type => params.treatmentTypes?.includes(type.id));

    const matchesAmenities = !params.amenities?.length ||
      facility.amenityObjects?.some(amenity => params.amenities?.includes(amenity.id));

    const matchesInsurance = !params.insurance?.length ||
      facility.insurances?.some(ins => params.insurance?.includes(ins.id));

    const matchesConditions = !params.conditions?.length ||
      facility.conditions?.some(condition => params.conditions?.includes(condition.id));

    const matchesSubstances = !params.substances?.length ||
      facility.substances?.some(substance => params.substances?.includes(substance.id));

    const matchesTherapies = !params.therapies?.length ||
      facility.therapies?.some(therapy => params.therapies?.includes(therapy.id));

    const matchesLanguages = !params.languages?.length ||
      facility.languageObjects?.some(lang => params.languages?.includes(lang.id));

    const matchesRating = !params.rating ||
      (facility.rating && facility.rating >= (params.rating || 0));

    return matchesSearch &&
      matchesLocation &&
      matchesTreatmentTypes &&
      matchesAmenities &&
      matchesInsurance &&
      matchesConditions &&
      matchesSubstances &&
      matchesTherapies &&
      matchesLanguages &&
      matchesRating;
  });
}
```

### Search Hook

The useSearch hook provides a simple interface for components to use the search functionality:

```typescript
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

    // Debounce search to prevent too many requests
    const timeoutId = setTimeout(searchFacilities, 300);
    return () => clearTimeout(timeoutId);
  }, [query, filters]);

  return { results, loading, error };
}
```

### Filter Bar Component

The FilterBar component handles all search filters:

```typescript
interface FilterBarProps {
  filters: SearchFiltersState;
  filterOptions: {
    locations: Set<string>;
    treatmentTypes: Set<string>;
    amenities: Set<string>;
    conditions: Set<string>;
    substances: Set<string>;
    therapies: Set<string>;
    languages: Set<string>;
  };
  optionCounts: {
    locations: { [key: string]: number };
    treatmentTypes: { [key: string]: number };
    amenities: { [key: string]: number };
    conditions: { [key: string]: number };
    substances: { [key: string]: number };
    therapies: { [key: string]: number };
    languages: { [key: string]: number };
  };
  onFilterChange: (type: keyof SearchFiltersState, value: string, clearOthers?: boolean) => void;
}

export default function FilterBar({ 
  filters, 
  filterOptions, 
  optionCounts, 
  onFilterChange 
}: FilterBarProps) {
  // Implementation details...
}
```

## Key Features

1. **Archived Facilities**
   - Automatically excluded from search results
   - Only visible in admin view when specifically requested
   - Separate query for archived facilities

2. **Location Handling**
   - Proper city/state format parsing
   - Case-insensitive matching
   - Multiple location support
   - Exact city/state matching

3. **Collection Filtering**
   - ID-based matching for all collections
   - Proper handling of optional fields
   - Support for multiple selections
   - Count tracking for each option

4. **Performance Optimizations**
   - Search debouncing (300ms)
   - Efficient filtering
   - Proper null checks
   - Optional chaining for safety
   - Minimal re-renders

## Best Practices

1. **Type Safety**
   - Use proper interfaces for all parameters
   - Handle null/undefined cases
   - Validate input data
   - Proper error handling

2. **Performance**
   - Debounce search requests
   - Filter in memory when possible
   - Use proper indexes in Firestore
   - Batch updates when needed

3. **User Experience**
   - Clear filter labels
   - Count indicators
   - Loading states
   - Error handling
   - Clear filters option

4. **Code Organization**
   - Separate concerns (service, hook, components)
   - Clear interfaces
   - Consistent error handling
   - Proper documentation

## Testing

```typescript
describe('facilitiesService.searchFacilities', () => {
  it('filters by location correctly', async () => {
    const results = await facilitiesService.searchFacilities({
      query: '',
      location: ['Phoenix, AZ']
    });
    expect(results.every(f => 
      f.city.toLowerCase() === 'phoenix' && 
      f.state.toLowerCase() === 'az'
    )).toBe(true);
  });

  it('combines multiple filters', async () => {
    const results = await facilitiesService.searchFacilities({
      location: ['Los Angeles, CA'],
      treatmentTypes: ['inpatient'],
      rating: 4
    });
    expect(results.every(f => 
      f.city.toLowerCase() === 'los angeles' &&
      f.state.toLowerCase() === 'ca' &&
      f.treatmentTypes.some(t => t.id === 'inpatient') &&
      f.rating >= 4
    )).toBe(true);
  });

  it('excludes archived facilities', async () => {
    const results = await facilitiesService.searchFacilities({
      query: ''
    });
    expect(results.every(f => f.moderationStatus !== 'archived')).toBe(true);
  });
});
```

## Related Documentation

- [Services Documentation](../SERVICES.md)
- [Components Documentation](../components/README.md)
- [Implementation Guide](./implementation.md)
- [Collections Documentation](./collections.md)
