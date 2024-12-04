import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { locationsService } from '../services/locations';
import { FeaturedLocation } from '../types';

export default function LocationBrowser() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<FeaturedLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const featuredLocations = await locationsService.getFeaturedLocations();
        setLocations(featuredLocations);
      } catch (error) {
        console.error('Error fetching featured locations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  const handleLocationClick = (city: string, state: string) => {
    const searchParams = new URLSearchParams();
    searchParams.set('location', `${city}, ${state}`);
    navigate(`/search?${searchParams.toString()}`);
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Location</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find treatment centers in major cities across the United States
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  if (locations.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse by Location</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Find treatment centers in major cities across the United States
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {locations.map((location) => (
            <button 
              key={location.id}
              onClick={() => handleLocationClick(location.city, location.state)}
              className="group relative block w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-xl overflow-hidden"
            >
              <div className="relative overflow-hidden rounded-xl aspect-[3/2]">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/75 to-black/90" />
                {location.image ? (
                  <img 
                    src={location.image} 
                    alt={location.city}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  // Fallback image if none is set
                  <img 
                    src={`https://source.unsplash.com/1200x800/?city,${location.city.toLowerCase()}`}
                    alt={location.city}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 p-8 flex flex-col items-center justify-center text-white text-center">
                  <h3 className="font-semibold text-3xl mb-2">{location.city}</h3>
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-xl opacity-90">{location.state}</span>
                    <span className="bg-white/20 px-4 py-1.5 rounded-full backdrop-blur-sm">
                      {location.totalListings} {location.totalListings === 1 ? 'center' : 'centers'}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
