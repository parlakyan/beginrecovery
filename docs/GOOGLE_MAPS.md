# Google Maps Integration Guide

## Overview
This project uses various Google Maps APIs for location-based features:
- Maps Embed API: For displaying maps on facility detail pages
- Places API: For address autocomplete
- Maps JavaScript API: Required for Places API functionality

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

#### Error Handling
The component includes robust error handling for:
- Missing place data
- Incomplete address components
- API loading failures
- Initialization errors

#### Address Component Processing
```typescript
// Example of address component extraction
if (place.address_components?.length) {
  try {
    const addressComponents = {};
    place.address_components.forEach((component) => {
      const type = component.types[0];
      if (type) {
        addressComponents[type] = component.long_name;
      }
    });
    // Process components...
  } catch (err) {
    console.warn('Error processing address components:', err);
  }
}
```

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

## Data Flow

### Address Selection
1. User enters address in AddressAutocomplete
2. Google Places API returns place data
3. Component extracts:
   - Formatted address
   - Coordinates
   - Address components
4. Data is saved to form state

### Map Display
1. MapSection receives location data
2. Attempts to use coordinates first
3. Falls back to address if coordinates unavailable
4. Displays loading state during initialization
5. Shows error message if map fails to load

## Error Handling

### Common Issues

#### "Cannot read properties of undefined"
- Cause: Incomplete place data from Places API
- Solution: Added null checks and try-catch blocks
- Fallback: Continue with available data
- Impact: Non-critical, functionality preserved

#### API Loading Failures
- Cause: Network issues or API restrictions
- Solution: Loading states and error messages
- Fallback: Display user-friendly error
- Recovery: Automatic retry on next interaction

#### Missing Address Components
- Cause: Partial data from Places API
- Solution: Validation before processing
- Fallback: Use available components
- Impact: Some fields may be incomplete

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
