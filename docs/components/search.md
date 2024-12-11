# Search Components

Components for search and filtering functionality.

## Table of Contents
- [FilterBar](#filterbar)
- [SearchResults](#searchresults)
- [RehabCard](#rehabcard)
- [FeaturedCarousel](#featuredcarousel)
- [Common Search Patterns](#common-search-patterns)

## FilterBar
Handles search filters for facilities.

### Features
- Location filtering by city and state
- Treatment type filtering
- Conditions filtering
- Substances filtering
- Therapies filtering
- Amenities filtering
- Rating filtering
- Search within filters
- Clear selection functionality
- Filter counts display

### Props
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
  };
  optionCounts: {
    locations: { [key: string]: number };
    treatmentTypes: { [key: string]: number };
    amenities: { [key: string]: number };
    conditions: { [key: string]: number };
    substances: { [key: string]: number };
    therapies: { [key: string]: number };
  };
  onFilterChange: (type: keyof SearchFiltersState, value: string, clearOthers?: boolean) => void;
}
```

### Usage
```tsx
<FilterBar
  filters={filters}
  filterOptions={filterOptions}
  optionCounts={optionCounts}
  onFilterChange={handleFilterChange}
/>
```

[Back to Top](#table-of-contents)

## SearchResults
Main component for displaying and filtering facilities.

### Features
- URL-based search
- Multiple filter types
- Location-based filtering
- Conditions filtering
- Substances filtering
- Therapies filtering
- Dynamic result updates
- Loading states
- Empty state handling
- Filter persistence

### State Management
```typescript
interface SearchFiltersState {
  location: string[];
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  conditions: string[];
  substances: string[];
  therapies: string[];
  rating: number | null;
  priceRange: number | null;
}
```

### Usage
```tsx
// URL-based search
/search?location=Los%20Angeles%2C%20CA

// Filter-based search
<SearchResults />
```

[Back to Top](#table-of-contents)

## RehabCard
Primary component for displaying facility information in search results.

### Features
- Responsive layout
- Verification badge
- Photo display
- Action buttons
- Status indicators
- Conditions and therapies display
- Tag management
- Owner controls

### Props
```typescript
interface RehabCardProps {
  facility: Facility;
  onEdit?: (facility: Facility) => void;
}
```

### Usage
```tsx
<RehabCard 
  facility={facility}
  onEdit={handleEdit}
/>
```

[Back to Top](#table-of-contents)

## FeaturedCarousel
Displays featured facilities in a carousel.

### Features
- Responsive layout
- Auto-play
- Touch navigation
- Progress indicators
- Location-based sorting
- Verified-only display

### Props
```typescript
interface FeaturedCarouselProps {
  facilities: Facility[];
  userLocation?: {
    lat: number;
    lng: number;
  };
  autoPlay?: boolean;
  interval?: number;
}
```

### Usage
```tsx
<FeaturedCarousel
  facilities={featuredFacilities}
  userLocation={userCoordinates}
  autoPlay={true}
  interval={5000}
/>
```

[Back to Top](#table-of-contents)

## Common Search Patterns

### URL Search Parameters
```typescript
const handleSearch = (filters: SearchFiltersState) => {
  const params = new URLSearchParams();
  
  if (filters.location.length) {
    params.set('location', filters.location[0]);
  }
  
  if (filters.rating) {
    params.set('rating', filters.rating.toString());
  }
  
  navigate(`/search?${params.toString()}`);
};
```

### Filter State Management
```typescript
const [filters, setFilters] = useState<SearchFiltersState>({
  location: [],
  treatmentTypes: [],
  amenities: [],
  insurance: [],
  conditions: [],
  substances: [],
  therapies: [],
  rating: null,
  priceRange: null
});

const handleFilterChange = (type: keyof SearchFiltersState, value: string) => {
  setFilters(prev => ({
    ...prev,
    [type]: prev[type].includes(value)
      ? prev[type].filter(v => v !== value)
      : [...prev[type], value]
  }));
};
```

### Search Debouncing
```typescript
const debouncedSearch = useCallback(
  debounce((query: string) => {
    performSearch(query);
  }, 300),
  []
);
```

### Location-Based Sorting
```typescript
const sortByDistance = (facilities: Facility[], userLocation: Coordinates) => {
  return facilities.sort((a, b) => {
    const distanceA = getDistance(userLocation, a.coordinates);
    const distanceB = getDistance(userLocation, b.coordinates);
    return distanceA - distanceB;
  });
};
```

[Back to Top](#table-of-contents)
