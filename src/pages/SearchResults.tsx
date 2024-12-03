import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { facilitiesService } from '../services/facilities';
import { Facility, SearchFiltersState } from '../types';
import { Button } from '../components/ui';
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

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const result = await facilitiesService.getFacilities(filters);
        const data = result.facilities;
        setFacilities(data);

        // Extract unique filter options
        const locations = new Set<string>();
        const treatmentTypes = new Set<string>();
        const amenities = new Set<string>();

        data.forEach((facility: Facility) => {
          locations.add(facility.location);
          facility.tags.forEach((tag: string) => treatmentTypes.add(tag));
          facility.amenities.forEach((amenity: string) => amenities.add(amenity));
        });

        setFilterOptions({ locations, treatmentTypes, amenities });
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [searchParams, filters]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    setSearchParams({ q: query });
  };

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
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-4 mb-4">
              <div className="flex-grow relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  name="search"
                  placeholder="Search by name, location, or treatment type..."
                  defaultValue={searchParams.get('q') || ''}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <Button type="submit" variant="primary" className="px-8">
                Search
              </Button>
            </form>

            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              filterOptions={filterOptions}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
