import { useState, useEffect } from 'react';

interface LocationResult {
  location: string | null;
  loading: boolean;
  error: string | null;
}

export function useLocation(): LocationResult {
  const [location, setLocation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = async () => {
      try {
        setLoading(true);
        setError(null);

        // Try to get location from browser geolocation
        if ('geolocation' in navigator) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0
            });
          });

          const { latitude, longitude } = position.coords;

          // Use Google Maps Geocoding API to get location name
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
          );

          if (!response.ok) {
            throw new Error('Failed to fetch location data');
          }

          const data = await response.json();

          if (data.status === 'OK' && data.results && data.results.length > 0) {
            // Find city and state from address components
            const result = data.results[0];
            let city = '';
            let state = '';

            if (result.address_components) {
              for (const component of result.address_components) {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
                if (component.types.includes('administrative_area_level_1')) {
                  state = component.short_name;
                }
              }
            }

            // If we found both city and state, use them
            if (city && state) {
              setLocation(`${city}, ${state}`);
            } else {
              // Fallback to formatted address
              setLocation(result.formatted_address);
            }
          } else {
            setLocation(null);
          }
        } else {
          setLocation(null);
        }
      } catch (err) {
        console.error('Error getting location:', err);
        setError(err instanceof Error ? err.message : 'Failed to get location');
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    getLocation();
  }, []);

  return { location, loading, error };
}
