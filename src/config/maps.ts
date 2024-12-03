/**
 * Google Maps configuration
 */
export const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  region: 'US',
  language: 'en',
  libraries: ['places']
} as const;

// Ensure API key is available
if (!GOOGLE_MAPS_CONFIG.apiKey) {
  console.error('Google Maps API key is not set. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.');
}
