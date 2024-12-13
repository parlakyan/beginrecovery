# Google Maps Integration Guide

## Overview
This project uses various Google Maps APIs for location-based features:
- Maps Embed API: For displaying maps on facility detail pages
- Places API: For address autocomplete
- Maps JavaScript API: Required for Places API functionality
- Geocoding API: For batch address processing

## API Key Setup

### 1. Create API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "API Key"

### 2. Enable Required APIs
In "APIs & Services" > "Library", enable these APIs:
1. Maps Embed API
2. Places API
3. Maps JavaScript API
4. Geocoding API

### 3. Configure API Key Restrictions

#### Application Restrictions
1. Go to your API key settings
2. Under "Application restrictions", select "Websites"
3. Add your authorized domains:
   - Your production domain (e.g., beginrecovery.netlify.app)
   - Your staging domain (if any)
   - `localhost` (for local development)

#### API Restrictions
1. Under "API restrictions", select "Restrict key"
2. Select these APIs:
   - Maps Embed API
   - Places API
   - Maps JavaScript API
   - Geocoding API

### 4. Environment Setup

#### Local Development
Add to your `.env` file:
```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

#### Netlify Deployment
1. Go to Netlify Dashboard
2. Navigate to Site settings > Build & deploy > Environment
3. Add environment variable:
   - Key: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: Your Google Maps API key
4. Click "Save"
5. Redeploy your site

## Component Implementation

### AddressAutocomplete
Provides address suggestions with form integration:

```tsx
<AddressAutocomplete
  register={register}
  setValue={setValue}
  error={errors.location?.message}
/>
```

#### Features
- Address autocompletion
- Coordinates extraction
- Address component parsing
- Error handling
- Loading states

### MapSection
Displays a map for a facility location:

```tsx
<MapSection 
  coordinates={facility.coordinates}
  address={facility.location}
/>
```

#### Features
- Coordinates-based mapping
- Address fallback
- Loading states
- Error handling
- Responsive design

## Batch Geocoding Implementation

### Direct API Integration
We use direct fetch calls to the Geocoding API for better control and reliability:

```typescript
async function geocodeAddress(address: string, apiKey: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&region=us&components=country:US`;
    const response = await fetch(url, { signal: controller.signal });
    
    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(`Geocoding error: ${data.status}`);
    }

    return data.results[0];
  } finally {
    clearTimeout(timeoutId);
  }
}
```

### Rate Limiting and Optimization
- Batch size: 25 addresses per batch
- Delay between batches: 2 seconds
- Request timeout: 30 seconds
- Maximum retries: 3 attempts
- Exponential backoff between retries

### Error Handling
```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) throw error;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryWithBackoff(fn, retries - 1, delay * 2);
  }
}
```

### Address Component Processing
```typescript
// Extract city and state from address components
let city = '';
let state = '';
for (const component of result.address_components) {
  if (component.types.includes('locality')) {
    city = component.long_name;
  }
  if (component.types.includes('administrative_area_level_1')) {
    state = component.short_name;
  }
}
```

## Error Handling

### Common Issues

#### API Timeouts
- Cause: Slow network or API response
- Solution: 30-second timeout with AbortController
- Fallback: Automatic retry with backoff
- Impact: Address marked for review if all retries fail

#### Invalid Addresses
- Cause: Malformed or non-existent addresses
- Solution: Validation and error handling
- Fallback: Mark for manual review
- Impact: Address needs manual verification

#### Rate Limiting
- Cause: Too many requests
- Solution: Batch processing with delays
- Fallback: Exponential backoff
- Impact: Slower processing but reliable

### Best Practices

#### Data Validation
1. Check for null/undefined values
2. Validate data structure
3. Use optional chaining
4. Implement fallbacks

#### Error Recovery
1. Graceful degradation
2. Clear error messages
3. Automatic retries
4. User feedback

#### Debugging
1. Console warnings
2. Error logging
3. State tracking
4. User feedback

## Monitoring

### Usage Tracking
1. Monitor API usage in Google Cloud Console
2. Set up usage alerts
3. Track error rates
4. Monitor costs

### Error Logging
1. Console warnings for debugging
2. Error tracking in monitoring tools
3. User error reporting
4. Performance monitoring

## Updates and Maintenance

### Regular Tasks
1. Review API usage and costs
2. Update API key restrictions
3. Monitor for deprecated features
4. Keep dependencies updated

### Documentation
1. Keep setup instructions current
2. Document known issues
3. Update troubleshooting guide
4. Maintain code examples
