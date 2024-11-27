import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import TreatmentFinder from '../components/TreatmentFinder';
import NearbyFacilities from '../components/NearbyFacilities';
import InsuranceChecker from '../components/InsuranceChecker';
import LocationBrowser from '../components/LocationBrowser';
import CoreValues from '../components/CoreValues';
<<<<<<< HEAD
import SearchFilters from '../components/SearchFilters';

export default function HomePage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
=======

interface Filters {
  location?: string;
  treatment?: string[];
  insurance?: string[];
}

const HomePage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({});
>>>>>>> parent of 61fd316 (Restire homepage sections)

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        setError(null);
        const { facilities: loadedFacilities } = await facilitiesService.getFacilities();
        setFacilities(loadedFacilities);
      } catch (err) {
        console.error('Error loading facilities:', err);
        setError('Failed to load facilities. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, []);

<<<<<<< HEAD
=======
  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // TODO: Implement filter logic
  };

>>>>>>> parent of 61fd316 (Restire homepage sections)
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
<<<<<<< HEAD
      <TreatmentFinder />
      <NearbyFacilities facilities={facilities} loading={loading} />
      <InsuranceChecker />
      <LocationBrowser />
      <CoreValues />
      <SearchFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={{
          treatmentTypes: [],
          amenities: [],
          insurance: [],
          rating: null,
          priceRange: null
        }}
        onFilterChange={() => {}}
      />
      <Footer />
=======
      
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Featured Facilities</h2>
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
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility) => (
              <ListingCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}
      </div>

      <LocationBrowser />
      <CoreValues />
>>>>>>> parent of 61fd316 (Restire homepage sections)
    </div>
  );
}