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
5. Redeploy your site:
   ```bash
   git push # if using Git deployment
   # or
   netlify deploy --prod # if using Netlify CLI
   ```

Note: After adding/changing environment variables in Netlify:
- Clear deploy cache
- Trigger a new deployment
- Wait 5-10 minutes for changes to propagate

## Component Usage

### MapSection
Displays a map for a facility location:
```tsx
<MapSection 
  coordinates={{
    lat: facility.coordinates.lat,
    lng: facility.coordinates.lng
  }}
/>
```

### AddressAutocomplete
Provides address suggestions with form integration:
```tsx
<AddressAutocomplete
  register={register}
  setValue={setValue}
  error={errors.location?.message}
/>
```

## Troubleshooting

### Common Issues

#### "This API project is not authorized to use this API"
1. Check API enablement:
   - Verify all required APIs are enabled
   - Wait 5-10 minutes for changes to propagate
2. Verify API key restrictions:
   - Check domain is listed in authorized websites
   - Confirm all required APIs are selected
3. Environment variables:
   - Verify key is set in Netlify environment
   - Check for typos in variable name
   - Ensure site was redeployed after changes

#### "Request denied" or 403 errors
1. Check billing status:
   - Enable billing if required
   - Verify no payment issues
2. Domain verification:
   - Ensure domain matches restrictions
   - Include www/non-www variants if needed
3. API key format:
   - Verify key is correctly copied
   - Check for whitespace in key

#### Address Autocomplete not working
1. Check console for errors
2. Verify Places API is enabled
3. Confirm JavaScript API is enabled
4. Test with unrestricted key temporarily

## Best Practices

### Security
1. Always use API key restrictions
2. Enable only required APIs
3. Monitor usage and set quotas
4. Use environment variables

### Performance
1. Load APIs asynchronously
2. Implement proper error handling
3. Show loading states
4. Cache geocoding results when possible

### User Experience
1. Provide clear error messages
2. Show loading indicators
3. Handle network issues gracefully
4. Implement fallback content

## Monitoring

### Usage Tracking
1. Monitor API usage in Google Cloud Console
2. Set up usage alerts
3. Track error rates
4. Monitor costs

### Error Handling
1. Log API errors
2. Monitor client-side errors
3. Track user feedback
4. Set up error alerts

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
