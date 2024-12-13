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
 * Using a grey background with image icon SVG
 */
export const DEFAULT_FACILITY_IMAGE = `data:image/svg+xml,${encodeURIComponent(`
<svg width="640" height="480" viewBox="0 0 640 480" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="640" height="480" fill="#F3F4F6"/>
  <path d="M320 220C314.477 220 310 224.477 310 230V270C310 275.523 314.477 280 320 280H360C365.523 280 370 275.523 370 270V230C370 224.477 365.523 220 360 220H320ZM290 230C290 213.431 303.431 200 320 200H360C376.569 200 390 213.431 390 230V270C390 286.569 376.569 300 360 300H320C303.431 300 290 286.569 290 270V230ZM330 240C330 235.029 334.029 231 339 231C343.971 231 348 235.029 348 240C348 244.971 343.971 249 339 249C334.029 249 330 244.971 330 240Z" fill="#9CA3AF"/>
</svg>
`)}`;
