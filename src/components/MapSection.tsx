import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';

interface MapSectionProps {
  coordinates: {
    lat: number;
    lng: number;
  };
}

export default function MapSection({ coordinates }: MapSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get API key from environment variables
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    // Check if API key exists
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps API key is not configured');
      setIsLoading(false);
      return;
    }

    // Validate coordinates
    if (!coordinates?.lat || !coordinates?.lng) {
      setError('Invalid location coordinates');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  }, [GOOGLE_MAPS_API_KEY, coordinates]);

  if (error) {
    return (
      <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <MapPin className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold">Location</h2>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <MapPin className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Location</h2>
      </div>

      <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={`https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${coordinates.lat},${coordinates.lng}&zoom=15`}
          allowFullScreen
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError('Failed to load map');
            setIsLoading(false);
          }}
        />
      </div>
    </section>
  );
}
