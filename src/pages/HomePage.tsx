import { useEffect, useState } from 'react';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import SearchFilters from '../components/SearchFilters';
import ListingCard from '../components/ListingCard';
import TreatmentFinder from '../components/TreatmentFinder';
import InsuranceSection from '../components/InsuranceSection';
import CertificationsSection from '../components/CertificationsSection';
import CoreValues from '../components/CoreValues';
import ReviewsSection from '../components/ReviewsSection';
import StaffSection from '../components/StaffSection';
import MapSection from '../components/MapSection';
import LocationBrowser from '../components/LocationBrowser';

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
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const [allFacilities, featured] = await Promise.all([
          facilitiesService.getFacilities(),
          facilitiesService.getFeaturedFacilities()
        ]);
        setFacilities(allFacilities.facilities || []);
        setFeaturedFacilities(featured);
      } catch (error) {
        console.error('Error fetching facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  // Get the first facility for reviews and map
  const firstFacility = facilities[0] || null;
  const coordinates = firstFacility ? { lat: 34.0522, lng: -118.2437 } // Example coordinates for LA
                                  : { lat: 0, lng: 0 };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main>
        <HeroSection />
        
        <div className="container mx-auto px-4 py-12">
          <SearchFilters 
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Featured Listings */}
        {featuredFacilities.length > 0 && (
          <section className="bg-white py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Featured Treatment Centers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredFacilities.map((facility) => (
                  <ListingCard key={facility.id} facility={facility} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Listings */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Recent Treatment Centers</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : facilities.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No treatment centers found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {facilities.map((facility) => (
                  <ListingCard key={facility.id} facility={facility} />
                ))}
              </div>
            )}
          </div>
        </section>

        <TreatmentFinder />
        <InsuranceSection />
        <CertificationsSection />
        <CoreValues />
        <ReviewsSection facility={firstFacility} />
        <StaffSection />
        <MapSection coordinates={coordinates} />
        <LocationBrowser />
      </main>

      <Footer />
    </div>
  );
}
