/**
 * Get Google Street View image URL for a given location
 * Maximum size supported by Street View API is 640x640
 * @param lat Latitude
 * @param lng Longitude
 * @param size Image size (default: 640x640)
 * @returns Street View image URL or null if coordinates are invalid
 */
export const getStreetViewUrl = (lat?: number, lng?: number, size: string = '640x640'): string | null => {
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
 * Using a grey background with image placeholder icon matching admin dashboard
 */
export const DEFAULT_FACILITY_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg width="640" height="480" viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="480" fill="#F3F4F6"/>
  <path d="M260 200H380V300H260V200ZM270 290H370V210H270V290ZM280 280L300 250L315 265L350 230L360 240V220H280V280Z" fill="#9CA3AF"/>
</svg>
`)}`;
