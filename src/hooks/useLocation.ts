import { useState, useEffect } from 'react';

interface LocationState {
  location: string | null;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const getLocation = async () => {
      try {
        // Try to get location from browser geolocation
        if ('geolocation' in navigator) {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });

          // Use reverse geocoding to get city/state
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.coords.latitude},${position.coords.longitude}&key=${process.env.VITE_GOOGLE_MAPS_API_KEY}`
          );
          const data = await response.json();

          // Extract city and state from address components
          let city = '';
          let state = '';
          for (const component of data.results[0].address_components) {
            if (component.types.includes('locality')) {
              city = component.long_name;
            }
            if (component.types.includes('administrative_area_level_1')) {
              state = component.short_name;
            }
          }

          setState({
            location: `${city}, ${state}`,
            loading: false,
            error: null
          });
        } else {
          throw new Error('Geolocation is not supported by your browser');
        }
      } catch (error) {
        console.error('Error getting location:', error);
        setState({
          location: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to get location'
        });
      }
    };

    getLocation();
  }, []);

  return state;
}
