/**
 * Get Google Street View image URL for a given location
 * @param lat Latitude
 * @param lng Longitude
 * @param size Image size (default: 640x480)
 * @returns Street View image URL or null if coordinates are invalid
 */
export const getStreetViewUrl = (lat?: number, lng?: number, size: string = '640x480'): string | null => {
  if (!lat || !lng) return null;

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is not configured');
    return null;
  }

  return `https://maps.googleapis.com/maps/api/streetview?size=${size}&location=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
};

/**
 * Default placeholder image for facilities without photos
 */
export const DEFAULT_FACILITY_IMAGE = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=640&h=480&q=80';
