import { useState, useEffect } from 'react';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import HeroSection from '../components/HeroSection';
import ListingCard from '../components/ListingCard';
import LocationBrowser from '../components/LocationBrowser';
import InsuranceSection from '../components/InsuranceSection';
import CoreValues from '../components/CoreValues';

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

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const { facilities: data } = await facilitiesService.getFacilities();
        setFacilities(data);
      } catch (err) {
        setError('Error loading facilities');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // TODO: Implement filter logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      
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
      <InsuranceSection />
      <CoreValues />
    </div>
  );
};

export default HomePage;
