import { useEffect, useState } from 'react';
import { facilitiesService } from '../services/firebase';
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

const defaultFilters = {
  treatmentTypes: [],
  amenities: [],
  insurance: [],
  rating: null,
  priceRange: null
};

export default function HomePage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [featuredFacilities, setFeaturedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState(defaultFilters);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        
        // Fetch facilities and featured facilities in parallel
        const [allFacilities, featured] = await Promise.all([
          facilitiesService.getFacilities(),
          facilitiesService.getFeaturedFacilities()
        ]);
        
        // Filter valid facilities
        const validFacilities = (allFacilities.facilities || [])
          .filter((f: Facility) => f && 
                      typeof f.rating === 'number' && 
                      f.moderationStatus === 'approved');
        
        const validFeatured = (featured || [])
          .filter((f: Facility) => f && 
                      typeof f.rating === 'number' && 
                      f.moderationStatus === 'approved');
        
        console.log('Fetched facilities:', {
          total: validFacilities.length,
          featured: validFeatured.length
        });
        
        setFacilities(validFacilities);
        setFeaturedFacilities(validFeatured);
      } catch (error) {
        console.error('Error fetching facilities:', error);
        setFacilities([]);
        setFeaturedFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <HeroSection />
        
        <SearchFilters 
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          filters={filters}
          onFilterChange={setFilters}
        />

        {/* Featured Treatment Centers */}
        {featuredFacilities.length > 0 && (
          <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
              <div className="flex justify-between items-center mb-12">
                <div className="text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">Featured Treatment Centers</h2>
                  <p className="text-gray-600">Discover our highly-rated rehabilitation facilities</p>
                </div>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {featuredFacilities.map((facility) => (
                  facility && <RehabCard key={facility.id} facility={facility} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Find Treatment Section */}
        <TreatmentFinder />

        {/* Recent Treatment Centers */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Recent Treatment Centers</h2>
                <p className="text-gray-600">Browse our latest verified rehabilitation facilities</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {loading ? (
                <div className="col-span-3 flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : facilities.length === 0 ? (
                <div className="col-span-3 text-center py-12">
                  <p className="text-gray-600">No treatment centers found.</p>
                </div>
              ) : (
                facilities.map((facility) => (
                  facility && <RehabCard key={facility.id} facility={facility} />
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
      </main>

      <Footer />
    </div>
  );
}
