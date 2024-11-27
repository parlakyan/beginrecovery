import { useState, useEffect } from 'react';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
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
  const [topRatedFacilities, setTopRatedFacilities] = useState<Facility[]>([]);
  const [nearbyFacilities, setNearbyFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<SearchFiltersState>({
    treatmentTypes: [],
    amenities: [],
    insurance: [],
    rating: null,
    priceRange: null
  });

  const fetchFacilities = async (isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      console.log('Fetching facilities for homepage...');
      const { facilities: data, lastVisible: last, hasMore: more } = 
        await facilitiesService.getFacilities(isLoadMore ? lastVisible : undefined);
      
      console.log('Received facilities:', data);

      if (isLoadMore) {
        setFacilities(prev => [...prev, ...data]);
      } else {
        setFacilities(data);
      }

      setLastVisible(last || undefined);
      setHasMore(more);
      setError(null);
    } catch (err) {
      console.error('Error fetching facilities:', err);
      setError('Error loading facilities');
    } finally {
      if (isLoadMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchTopRated = async () => {
    try {
      console.log('Fetching top rated facilities...');
      const topRated = await facilitiesService.getTopRatedFacilities(6);
      console.log('Received top rated facilities:', topRated);
      if (topRated && topRated.length > 0) {
        setTopRatedFacilities(topRated);
      }
    } catch (error) {
      console.error('Error fetching top rated facilities:', error);
      // Don't set error state here to allow main facilities list to still show
    }
  };

  const fetchNearbyFacilities = async () => {
    try {
      console.log('Fetching nearby facilities...');
      const nearby = await facilitiesService.getNearbyFacilities('California', 6);
      console.log('Received nearby facilities:', nearby);
      if (nearby && nearby.length > 0) {
        setNearbyFacilities(nearby);
      }
    } catch (error) {
      console.error('Error fetching nearby facilities:', error);
      // Don't set error state here to allow main facilities list to still show
    }
  };

  useEffect(() => {
    // Fetch main facilities first
    fetchFacilities().then(() => {
      // Only fetch additional sections after main facilities are loaded
      fetchTopRated();
      fetchNearbyFacilities();
    });
  }, []);

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchFacilities(true);
    }
  };

  const handleFilterChange = async (newFilters: SearchFiltersState) => {
    setFilters(newFilters);
    try {
      setLoading(true);
      const searchResults = await facilitiesService.searchFacilities({
        query: '',
        tags: newFilters.treatmentTypes,
        insurance: newFilters.insurance,
        rating: newFilters.rating || undefined
      });
      setFacilities(searchResults);
      setHasMore(false); // Disable load more when filters are applied
    } catch (error) {
      console.error('Error applying filters:', error);
      setError('Error filtering facilities');
    } finally {
      setLoading(false);
    }
  };

  const renderFacilitySection = (title: string, subtitle: string, items: Facility[]) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mb-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <p className="text-gray-600">{subtitle}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((facility) => (
            <RehabCard key={facility.id} facility={facility} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        <HeroSection />
        <TreatmentFinder />
        
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-12">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">Featured Facilities</h2>
                <p className="text-gray-600">Browse our selection of top rehabilitation centers</p>
              </div>
              <button
                onClick={() => setIsFiltersOpen(true)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                All Facilities
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
              <div className="space-y-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {facilities.map((facility) => (
                    <RehabCard key={facility.id} facility={facility} />
                  ))}
                </div>

                {renderFacilitySection(
                  'Top Rated Facilities',
                  'Highest rated treatment centers',
                  topRatedFacilities
                )}

                {renderFacilitySection(
                  'Nearby Facilities',
                  'Treatment centers in your area',
                  nearbyFacilities
                )}

                {hasMore && (
                  <div className="text-center mt-12">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </div>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

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
