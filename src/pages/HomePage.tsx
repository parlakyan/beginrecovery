import { useState, useEffect } from 'react';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import RehabCard from '../components/RehabCard';
import LocationBrowser from '../components/LocationBrowser';
import InsuranceSection from '../components/InsuranceSection';
import CoreValues from '../components/CoreValues';
import SearchFilters from '../components/SearchFilters';
import TreatmentFinder from '../components/TreatmentFinder';

interface SearchFiltersState {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}

const HomePage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFiltersState>({
    treatmentTypes: [],
    amenities: [],
    insurance: [],
    rating: null,
    priceRange: null
  });

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const { facilities: data } = await facilitiesService.getFacilities();
        setFacilities(data);
      } catch (err) {
        console.error('Error fetching facilities:', err);
        setError('Error loading facilities');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const handleFilterChange = (newFilters: SearchFiltersState) => {
    setFilters(newFilters);
    // TODO: Implement filter logic
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <TreatmentFinder />
        
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Facilities</h2>
              <p className="text-gray-600">Browse our selection of top rehabilitation centers</p>
            </div>
            <button
              onClick={() => setIsFiltersOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Filter Results
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-600 py-8">
              <p className="text-lg mb-2">{error}</p>
              <p className="text-sm text-gray-600">Please check back later or contact support if the issue persists.</p>
            </div>
          ) : facilities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">No facilities available at this time.</p>
              <p className="text-sm text-gray-500 mt-2">Please check back later for updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <RehabCard key={facility.id} facility={facility} />
              ))}
            </div>
          )}
        </div>

        <LocationBrowser />
        <InsuranceSection />
        <CoreValues />

        {isFiltersOpen && (
          <SearchFilters
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            filters={filters}
            onFilterChange={handleFilterChange}
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
