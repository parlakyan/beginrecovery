# Search System

This document details the search and filter system implementation in the Recovery Directory.

## Overview

The search system provides:
- Full-text search across all fields
- Multi-criteria filtering
- Location-based search
- Sort by relevance, rating, and verification status
- Real-time updates

## Implementation

### Search Parameters

```typescript
// src/services/facilities/types.ts
export interface SearchParams {
  query: string;          // Text search query
  location: string[];     // Array of "city,state" strings
  treatmentTypes: string[]; // Treatment type IDs
  amenityObjects: string[]; // Amenity IDs
  insurances: string[];   // Insurance IDs
  conditions: string[];   // Condition IDs
  substances: string[];   // Substance IDs
  therapies: string[];    // Therapy IDs
  languageObjects: string[]; // Language IDs
  rating: number | null;  // Minimum rating filter
}
```

### Search Function

```typescript
// src/services/facilities/search.ts
export const facilitiesSearch = {
  async searchFacilities(params: SearchParams): Promise<Facility[]> {
    try {
      // Get base query for approved facilities
      const facilitiesRef = collection(db, FACILITIES_COLLECTION);
      const q = query(
        facilitiesRef,
        where('moderationStatus', '==', 'approved')
      );

      // Get facilities and filter in memory
      const snapshot = await getDocs(q);
      let facilities = snapshot.docs.map(doc => transformFacilityData(doc));

      // Apply filters
      facilities = facilities.filter(facility => {
        // Text search across all fields
        const matchesQuery = this.matchesTextSearch(facility, params.query);

        // Location filter
        const matchesLocation = this.matchesLocation(facility, params.location);

        // Field-specific filters using managed fields
        const matchesTreatment = this.matchesFieldFilter(
          facility.treatmentTypes,
          params.treatmentTypes
        );

        const matchesAmenities = this.matchesFieldFilter(
          facility.amenityObjects,
          params.amenityObjects
        );

        const matchesInsurance = this.matchesFieldFilter(
          facility.insurances,
          params.insurances
        );

        const matchesConditions = this.matchesFieldFilter(
          facility.conditions,
          params.conditions
        );

        const matchesSubstances = this.matchesFieldFilter(
          facility.substances,
          params.substances
        );

        const matchesTherapies = this.matchesFieldFilter(
          facility.therapies,
          params.therapies
        );

        const matchesLanguages = this.matchesFieldFilter(
          facility.languageObjects,
          params.languageObjects
        );

        return matchesQuery && 
               matchesLocation && 
               matchesTreatment && 
               matchesAmenities &&
               matchesInsurance &&
               matchesConditions &&
               matchesSubstances &&
               matchesTherapies &&
               matchesLanguages;
      });

      // Apply sorting
      return this.sortResults(facilities, params.query);
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  },

  private matchesTextSearch(facility: Facility, query: string): boolean {
    if (!query) return true;

    const searchText = query.toLowerCase();
    const searchableFields = [
      facility.name,
      facility.description,
      facility.location,
      facility.city,
      facility.state,
      facility.email,
      facility.phone,
      ...(facility.treatmentTypes?.map(t => t.name) || []),
      ...(facility.substances?.map(s => s.name) || []),
      ...(facility.amenityObjects?.map(a => a.name) || []),
      ...(facility.insurances?.map(i => i.name) || []),
      ...(facility.languageObjects?.map(l => l.name) || []),
      ...(facility.conditions?.map(c => c.name) || []),
      ...(facility.therapies?.map(t => t.name) || [])
    ];

    return searchableFields.some(field => 
      field && field.toString().toLowerCase().includes(searchText)
    );
  },

  private matchesLocation(facility: Facility, locations: string[]): boolean {
    if (!locations?.length) return true;

    return locations.some(loc => {
      const [city, state] = loc.split(',').map(part => part.trim());
      return facility.city.toLowerCase() === city.toLowerCase() &&
             facility.state.toLowerCase() === state.toLowerCase();
    });
  },

  private matchesFieldFilter<T extends { id: string }>(
    facilityFields: T[] | undefined,
    filterIds: string[]
  ): boolean {
    if (!filterIds?.length) return true;
    return filterIds.some(id => 
      facilityFields?.some(field => field.id === id)
    );
  },

  private sortResults(facilities: Facility[], query: string): Facility[] {
    return facilities.sort((a, b) => {
      // Sort by exact name match
      const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
      const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;

      // Then by rating
      if (b.rating !== a.rating) return b.rating - a.rating;

      // Then by verification status
      if (a.isVerified && !b.isVerified) return -1;
      if (!a.isVerified && b.isVerified) return 1;

      // Finally by name
      return a.name.localeCompare(b.name);
    });
  }
};
```

### Search Hook

```typescript
// src/hooks/useSearch.ts
export function useSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [results, setResults] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const search = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {
          query: searchParams.get('q') || '',
          location: searchParams.getAll('location'),
          treatmentTypes: searchParams.getAll('treatmentTypes'),
          amenityObjects: searchParams.getAll('amenities'),
          insurances: searchParams.getAll('insurances'),
          conditions: searchParams.getAll('conditions'),
          substances: searchParams.getAll('substances'),
          therapies: searchParams.getAll('therapies'),
          languageObjects: searchParams.getAll('languages'),
          rating: searchParams.get('rating') 
            ? Number(searchParams.get('rating')) 
            : null
        };

        const facilities = await facilitiesSearch.searchFacilities(params);
        setResults(facilities);
      } catch (error) {
        console.error('Search error:', error);
        setError('Failed to perform search');
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [searchParams]);

  const updateSearch = useCallback((updates: Partial<SearchParams>) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      newParams.delete(key);
      if (Array.isArray(value)) {
        value.forEach(v => newParams.append(key, v));
      } else if (value) {
        newParams.set(key, value.toString());
      }
    });
    setSearchParams(newParams);
  }, [searchParams, setSearchParams]);

  return { results, loading, error, updateSearch };
}
```

## Filter Components

### Filter Bar

```typescript
// src/components/FilterBar.tsx
export default function FilterBar() {
  const [searchParams, setSearchParams] = useSearchParams();

  const handleFilterChange = (type: string, values: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete(type);
    values.forEach(value => newParams.append(type, value));
    setSearchParams(newParams);
  };

  return (
    <div className="space-y-4">
      <DropdownSelect
        label="Treatment Types"
        type="treatmentTypes"
        value={(treatmentTypes || []).map(t => t.id)}
        onChange={(values) => {
          const selected = availableTreatmentTypes.filter(t => values.includes(t.id));
          setValue('treatmentTypes', selected);
        }}
        options={availableTreatmentTypes.map(type => ({
          value: type.id,
          label: type.name
        }))}
      />
      {/* Other filters follow same pattern */}
    </div>
  );
}
```

## Performance Considerations

1. **Query Optimization**
   - Use compound queries where possible
   - Filter in memory for complex queries
   - Cache frequently accessed data

2. **Search Debouncing**
   ```typescript
   const debouncedSearch = useCallback(
     debounce((query: string) => {
       updateSearch({ query });
     }, 300),
     []
   );
   ```

3. **Result Caching**
   ```typescript
   const searchCache = new Map<string, Facility[]>();
   
   const getCachedResults = (key: string) => {
     const cached = searchCache.get(key);
     if (cached) {
       const CACHE_TIME = 5 * 60 * 1000; // 5 minutes
       if (Date.now() - cached.timestamp < CACHE_TIME) {
         return cached.results;
       }
     }
     return null;
   };
   ```

## Related Documentation

- [Overview](./overview.md)
- [Collections](./collections.md)
- [Implementation Guide](./implementation.md)
