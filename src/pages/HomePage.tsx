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
import SearchFilters from '../components/SearchFilters';

export default function HomePage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection />
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
    </div>
  );
}