import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, MapPin, X } from 'lucide-react';
import { facilitiesService } from '../services/facilities';
import { Facility, SearchFiltersState } from '../types';
import { Button, Tag } from '../components/ui';
import RehabCard from '../components/RehabCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
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

  const toggleFilter = (type: keyof SearchFiltersState, value: string) => {
    setFilters(prev => {
      const current = prev[type] as string[];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [type]: updated };
    });
  };

  const clearFilters = () => {
    setFilters({
      treatmentTypes: [],
      amenities: [],
      insurance: [],
      rating: null,
      priceRange: null
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <form onSubmit={handleSearch} className="flex gap-4">
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
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            <div className={`w-80 flex-shrink-0 transition-all duration-300 ${showFilters ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-gray-600" />
                    <h2 className="text-lg font-semibold">Filters</h2>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={clearFilters}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear all
                  </Button>
                </div>

                {/* Location Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Location</h3>
                  <div className="space-y-2">
                    {Array.from(filterOptions.locations).map(location => (
                      <label key={location} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.treatmentTypes.includes(location)}
                          onChange={() => toggleFilter('treatmentTypes', location)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Treatment Types Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Treatment Types</h3>
                  <div className="space-y-2">
                    {Array.from(filterOptions.treatmentTypes).map(type => (
                      <label key={type} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.treatmentTypes.includes(type)}
                          onChange={() => toggleFilter('treatmentTypes', type)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Amenities Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">Amenities</h3>
                  <div className="space-y-2">
                    {Array.from(filterOptions.amenities).map(amenity => (
                      <label key={amenity} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => toggleFilter('amenities', amenity)}
                          className="rounded text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Minimum Rating</h3>
                  <div className="flex items-center gap-4">
                    {[5, 4, 3, 2, 1].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setFilters(prev => ({ ...prev, rating }))}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                          filters.rating === rating
                            ? 'bg-blue-50 text-blue-600'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            filters.rating === rating ? 'fill-current' : ''
                          }`}
                        />
                        <span>{rating}+</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-grow">
              {/* Active Filters */}
              <div className="mb-6 flex flex-wrap gap-2">
                {filters.treatmentTypes.map(type => (
                  <Tag
                    key={type}
                    variant="secondary"
                    onClose={() => toggleFilter('treatmentTypes', type)}
                  >
                    {type}
                  </Tag>
                ))}
                {filters.amenities.map(amenity => (
                  <Tag
                    key={amenity}
                    variant="secondary"
                    onClose={() => toggleFilter('amenities', amenity)}
                  >
                    {amenity}
                  </Tag>
                ))}
                {filters.rating && (
                  <Tag
                    variant="secondary"
                    onClose={() => setFilters(prev => ({ ...prev, rating: null }))}
                  >
                    {filters.rating}+ Stars
                  </Tag>
                )}
              </div>

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
                <div className="grid grid-cols-1 gap-6">
                  {facilities.map(facility => (
                    <RehabCard key={facility.id} facility={facility} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
