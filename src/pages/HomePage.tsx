import { useEffect, useState } from 'react';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import SearchFilters from '../components/SearchFilters';
import RehabCard from '../components/RehabCard';
import TreatmentFinder from '../components/TreatmentFinder';
import InsuranceSection from '../components/InsuranceSection';
import LocationBrowser from '../components/LocationBrowser';
import CoreValues from '../components/CoreValues';
import EditListingModal from '../components/EditListingModal';
import FeaturedCarousel from '../components/FeaturedCarousel';
import { useLocation } from '../hooks/useLocation';
import { Info } from 'lucide-react';

interface Filters {
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  conditions: string[];
  substances: string[];
  therapies: string[];
  languages: string[];
  rating: number | null;
  priceRange: [number, number] | null;
}

const defaultFilters: Filters = {
  treatmentTypes: [],
  amenities: [],
  insurance: [],
  conditions: [],
  substances: [],
  therapies: [],
  languages: [],
  rating: null,
  priceRange: null
};

export default function HomePage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [featuredFacilities, setFeaturedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const { location: userLocation, loading: locationLoading } = useLocation();

  const fetchFacilities = async (currentFilters = filters) => {
    try {
      setLoading(true);
      
      // Fetch facilities and featured facilities in parallel
      const [facilities, featured] = await Promise.all([
        facilitiesService.searchFacilities({
          query: '',
          location: [],
          treatmentTypes: currentFilters.treatmentTypes,
          amenities: currentFilters.amenities,
          insurance: currentFilters.insurance,
          conditions: currentFilters.conditions,
          substances: currentFilters.substances,
          therapies: currentFilters.therapies,
          languages: currentFilters.languages,
          rating: currentFilters.rating
        }),
        facilitiesService.getFeaturedFacilities()
      ]);
      
      console.log('Fetched facilities:', {
        total: facilities.length,
        featured: featured.length,
        filters: currentFilters,
        userLocation
      });
      
      setFacilities(facilities);
      setFeaturedFacilities(featured);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setFacilities([]);
      setFeaturedFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFacilities();
  }, [userLocation]); // Refetch when user location changes

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    fetchFacilities(newFilters);
  };

  const handleSave = async (data: Partial<Facility>) => {
    if (!editingFacility) return;
    try {
      await facilitiesService.updateFacility(editingFacility.id, data);
      // Refresh facilities after update
      fetchFacilities();
      setEditingFacility(null);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <HeroSection />

        {/* Featured Treatment Centers */}
        {(loading || locationLoading) ? (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            </div>
          </section>
        ) : featuredFacilities.length > 0 && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">Featured Treatment Centers</h2>
                  <p className="text-gray-600">
                    {userLocation ? 
                      `Discover highly-rated rehabilitation facilities near ${userLocation}` :
                      'Discover our highly-rated rehabilitation facilities'
                    }
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Ads</span>
                  <div className="group relative">
                    <Info className="w-4 h-4 text-gray-400 cursor-help" />
                    <div className="absolute right-0 mt-2 w-64 p-3 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <p className="text-sm text-gray-600">
                        We financially support the site through advertisers who pay for clearly marked placements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <FeaturedCarousel 
                facilities={featuredFacilities} 
                onEdit={setEditingFacility}
              />
            </div>
          </section>
        )}

        {/* Find Treatment Section */}
        <TreatmentFinder />

        {/* Recent Treatment Centers */}
        <section id="results-section" className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Recent Treatment Centers</h2>
                <p className="text-gray-600">Browse our latest rehabilitation facilities</p>
              </div>
              <button 
                onClick={() => setIsFiltersOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Filter Results
              </button>
            </div>

            <SearchFilters
              isOpen={isFiltersOpen}
              onClose={() => setIsFiltersOpen(false)}
              filters={filters}
              onFilterChange={handleFilterChange}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-8">
              {loading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : facilities.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600">No treatment centers found matching your criteria.</p>
                  <button
                    onClick={() => {
                      setFilters(defaultFilters);
                      fetchFacilities(defaultFilters);
                    }}
                    className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                facilities.map((facility) => (
                  <RehabCard 
                    key={facility.id} 
                    facility={facility} 
                    onEdit={setEditingFacility}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Insurance Section */}
        <InsuranceSection />

        {/* Location Browser */}
        <LocationBrowser />

        {/* Core Values Section */}
        <CoreValues />

        {/* Edit Modal */}
        {editingFacility && (
          <EditListingModal
            facility={editingFacility}
            isOpen={!!editingFacility}
            onClose={() => setEditingFacility(null)}
            onSave={handleSave}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
