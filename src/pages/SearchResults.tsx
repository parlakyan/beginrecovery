import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facilitiesService } from '../services/facilities';
import { Facility, SearchFiltersState } from '../types';
import RehabCard from '../components/RehabCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FilterBar from '../components/FilterBar';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersState>({
    treatmentTypes: [],
    amenities: [],
    insurance: [],
    rating: null,
    priceRange: null
  });

  // Get unique values for filter options from all facilities
  const [filterOptions, setFilterOptions] = useState<{
    locations: Set<string>;
    treatmentTypes: Set<string>;
    amenities: Set<string>;
  }>({
    locations: new Set<string>(),
    treatmentTypes: new Set<string>(),
    amenities: new Set<string>()
  });

  // Track counts for each option
  const [optionCounts, setOptionCounts] = useState<{
    locations: { [key: string]: number };
    treatmentTypes: { [key: string]: number };
    amenities: { [key: string]: number };
  }>({
    locations: {},
    treatmentTypes: {},
    amenities: {}
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const result = await facilitiesService.getFacilities(filters);
        const data = result.facilities;
        setFacilities(data);

        // Extract unique filter options and count occurrences
        const locations = new Set<string>();
        const treatmentTypes = new Set<string>();
        const amenities = new Set<string>();
        const counts = {
          locations: {} as { [key: string]: number },
          treatmentTypes: {} as { [key: string]: number },
          amenities: {} as { [key: string]: number }
        };

        data.forEach((facility: Facility) => {
          // Location counts
          locations.add(facility.location);
          counts.locations[facility.location] = (counts.locations[facility.location] || 0) + 1;

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

        setFilterOptions({ locations, treatmentTypes, amenities });
        setOptionCounts(counts);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [searchParams, filters]);

  const handleFilterChange = (type: keyof SearchFiltersState, value: string) => {
    setFilters(prev => {
      if (type === 'rating') {
        return { ...prev, rating: parseInt(value) };
      }
      
      const current = prev[type] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              {facilities.length} Treatment Centers Found
            </h2>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
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
