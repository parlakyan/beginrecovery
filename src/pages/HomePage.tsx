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
        
        // Ensure we have valid facilities and only show approved ones
        const validFacilities = (allFacilities.facilities || [])
          .filter(f => f && 
                      typeof f.rating === 'number' && 
                      f.moderationStatus === 'approved');
        
        const validFeatured = (featured || [])
          .filter(f => f && 
                      typeof f.rating === 'number' && 
                      f.moderationStatus === 'approved');
        
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
        
        <div className="container mx-auto px-4 py-12">
          <SearchFilters 
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Featured Treatment Centers */}
        {featuredFacilities.length > 0 && (
          <section className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  Featured Treatment Centers
                </h2>
                <p className="mt-4 text-xl text-gray-600">
                  Discover our highly-rated and trusted treatment facilities
                </p>
              </div>
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {featuredFacilities.map((facility) => (
                  facility && <ListingCard key={facility.id} facility={facility} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Find Treatment Section */}
        <TreatmentFinder />

        {/* Recent Treatment Centers */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Recent Treatment Centers
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Browse our latest verified treatment facilities
              </p>
            </div>
            <div className="mt-12">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                </div>
              ) : facilities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No treatment centers found.</p>
                </div>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {facilities.map((facility) => (
                    facility && <ListingCard key={facility.id} facility={facility} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Insurance Section */}
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Insurance Coverage
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                We work with major insurance providers
              </p>
            </div>
            <div className="mt-12">
              <InsuranceSection />
            </div>
          </div>
        </section>

        {/* Certifications Section */}
        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Certifications & Licenses
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Our facilities meet the highest standards
              </p>
            </div>
            <div className="mt-12">
              <CertificationsSection />
            </div>
          </div>
        </section>

        {/* Location Browser */}
        <section className="bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Browse by Location
              </h2>
              <p className="mt-4 text-xl text-gray-600">
                Find treatment centers in your area
              </p>
            </div>
            <div className="mt-12">
              <LocationBrowser />
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
