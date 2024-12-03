import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { facilitiesService } from '../services/facilities';
import { filterOptions, optionCounts } from '../data/filterOptions';
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
    treatmentTypes: [],
    amenities: [],
    insurance: [],
    rating: null,
    priceRange: null
  });

  // Convert test data to Sets
  const filterOptionsData = {
    locations: new Set(filterOptions.locations),
    treatmentTypes: new Set(filterOptions.treatmentTypes),
    amenities: new Set(filterOptions.amenities)
  };

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      try {
        const query = searchParams.get('q') || '';
        const result = await facilitiesService.getFacilities({
          ...filters,
          query
        });
        setFacilities(result.facilities);
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
        <div className="sticky top-[65px] bg-white border-b z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filter Bar */}
            <FilterBar
              filters={filters}
              filterOptions={filterOptionsData}
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
