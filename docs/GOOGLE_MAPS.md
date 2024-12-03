# Google Maps Integration

## Required APIs

You need to enable the following APIs in your Google Cloud Console:

1. **Maps Embed API**
   - Used for displaying maps on listing detail pages
   - Allows embedding Google Maps with markers
   - No usage limits in free tier

2. **Places API**
   - Used for address autocomplete in forms
   - Provides US address suggestions
   - Pay-per-use pricing

3. **Geocoding API**
   - Used to convert addresses to coordinates
   - Required for map markers
   - Pay-per-use pricing

## Setup Instructions

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Enable the above APIs:
   - Search for each API in the "APIs & Services" section
   - Click "Enable" for each one
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the key
5. Set up restrictions:
   - Click on the created API key
   - Under "Application restrictions", select "HTTP referrers"
   - Add your domains (including localhost for development)
   - Under "API restrictions", select the three APIs above

## Environment Variables

Add your API key to your Netlify environment variables:

```bash
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

## Usage

The API key is automatically used by:
- AddressAutocomplete component (Places API)
- MapSection component (Maps Embed API)
- ListingDetail page (Geocoding API)

## Testing

To verify the integration:
1. Create/edit a listing to test address autocomplete
2. View a listing to test map display
3. Check browser console for any API errors
