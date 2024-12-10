import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facilitiesService } from '../services/facilities';
import { Facility, SearchFiltersState } from '../types';
import RehabCard from '../components/RehabCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FilterBar from '../components/FilterBar';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersState>({
    location: [],
    treatmentTypes: [],
    amenities: [],
    insurance: [],
    rating: null,
    priceRange: null
  });

  // Scroll to top when search params change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams]);

  // Extract unique values and counts from facilities
  const getFilterOptions = (facilities: Facility[]) => {
    const locations = new Set<string>();
    const treatmentTypes = new Set<string>();
    const amenities = new Set<string>();
    const counts = {
      locations: {} as { [key: string]: number },
      treatmentTypes: {} as { [key: string]: number },
      amenities: {} as { [key: string]: number }
    };

    facilities.forEach((facility) => {
      // Location counts using city and state
      if (facility.city && facility.state) {
        const cityState = `${facility.city}, ${facility.state}`;
        locations.add(cityState);
        counts.locations[cityState] = (counts.locations[cityState] || 0) + 1;
      }

      // Treatment type counts
      facility.tags.forEach(tag => {
        treatmentTypes.add(tag);
        counts.treatmentTypes[tag] = (counts.treatmentTypes[tag] || 0) + 1;
      });

      // Amenity counts
      facility.amenities.forEach(amenity => {
        amenities.add(amenity);
        counts.amenities[amenity] = (counts.amenities[amenity] || 0) + 1;
      });
    });

    return {
      filterOptions: { locations, treatmentTypes, amenities },
      optionCounts: counts
    };
  };

  // Initialize filters from URL params
  useEffect(() => {
    const location = searchParams.get('location');
    if (location && filters.location.length === 0) {
      setFilters(prev => ({
        ...prev,
        location: [location]
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const query = searchParams.get('q') || '';
        
        const results = await facilitiesService.searchFacilities({
          query: query,
          location: filters.location,
          treatmentTypes: filters.treatmentTypes,
          amenities: filters.amenities,
          insurance: filters.insurance,
          rating: filters.rating === 0 ? null : filters.rating
        });

        setFacilities(results);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [searchParams, filters]);

  const { filterOptions, optionCounts } = getFilterOptions(facilities);

  const handleFilterChange = (type: keyof SearchFiltersState, value: string, clearOthers = false) => {
    setFilters((prev: SearchFiltersState) => {
      if (type === 'rating') {
        const ratingValue = parseInt(value);
        // If rating is 0 or matches current rating, clear it
        return { 
          ...prev, 
          rating: ratingValue === 0 || ratingValue === prev.rating ? null : ratingValue 
        };
      }
      
      const current = prev[type] as string[];
      
      // If clearOthers is true, replace the current selection instead of toggling
      if (clearOthers) {
        return {
          ...prev,
          [type]: [value]
        };
      }
      
      // Otherwise, toggle the selection
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  // Get the location for display
  const location = searchParams.get('location');
  const searchQuery = searchParams.get('q');
  const searchTitle = location || searchQuery || 'All Treatment Centers';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="sticky top-[65px] bg-white border-b z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              filterOptions={filterOptions}
              optionCounts={optionCounts}
              onFilterChange={handleFilterChange}
            />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Results Count */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {facilities.length} Treatment Centers {filters.location.length > 0 ? `in ${filters.location[0]}` : `Found`}
            </h2>
            {searchQuery && filters.location.length === 0 && (
              <p className="text-gray-600 mt-1">
                Search results for "{searchQuery}"
              </p>
            )}
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Treatment Centers Found
              </h3>
              <p className="text-gray-600">
                {filters.location.length > 0 
                  ? `We couldn't find any treatment centers in ${filters.location[0]}`
                  : 'Try adjusting your search criteria'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map(facility => (
                <RehabCard key={facility.id} facility={facility} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
