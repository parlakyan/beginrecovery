import React from 'react';
import { MapPin, Navigation, Loader2 } from 'lucide-react';
import RehabCard from './RehabCard';
import { Facility } from '../types';

interface NearbyFacilitiesProps {
  facilities: Facility[];
  loading: boolean;
}

export default function NearbyFacilities({ facilities, loading }: NearbyFacilitiesProps) {
  const [location, setLocation] = React.useState<GeolocationPosition | null>(null);
  const [loadingLocation, setLoadingLocation] = React.useState(false);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      setLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          setLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoadingLocation(false);
        }
      );
    }
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading nearby facilities...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Treatment Centers Near You</h2>
            {location && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Showing results near your location</span>
              </div>
            )}
          </div>
          {!location && (
            <button 
              onClick={handleGetLocation}
              disabled={loadingLocation}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              {loadingLocation ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Navigation className="w-5 h-5" />
              )}
              {loadingLocation ? 'Getting location...' : 'Enable Location'}
            </button>
          )}
        </div>

        {facilities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-600">No facilities found in your area.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.slice(0, 6).map((facility) => (
              <RehabCard key={facility.id} facility={facility} />
            ))}
          </div>
        )}

        {facilities.length > 6 && (
          <div className="text-center mt-12">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700">
              View All Centers
            </button>
          </div>
        )}
      </div>
    </section>
  );
}