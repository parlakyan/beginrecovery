# Photo Upload Documentation

## Overview
The photo upload system uses Firebase Cloud Storage to handle facility images. It supports up to 12 photos per facility, with different display rules for verified and unverified listings.

## Verification-Based Features

### Verified (Paid) Listings
- Show all uploaded photos (up to 12)
- Full slideshow functionality
- Navigation controls (arrows and dots)
- Touch swipe support
- Photo grid in edit modal
- Multiple photo upload support

### Unverified (Free) Listings
- Show only the first photo
- No slideshow functionality
- Can still upload multiple photos (shown after upgrading)
- Basic image display
- Photos beyond the first are stored but not displayed

## Features
- Maximum 12 photos per facility
- Drag and drop support
- Progress tracking
- File validation
- Responsive image grid display
- Automatic display mode based on verification status

## Storage Structure
Images are stored in Firebase Cloud Storage with the following structure:
```
gs://beginrecovery-bb288.appspot.com/
└── facilities/
    └── [facilityId]/
        └── [timestamp]-[randomString]-[filename]
```

Example:
```
gs://beginrecovery-bb288.appspot.com/facilities/abc123/1684789123456-x7y9z2-photo.jpg
```

## File Restrictions
- Maximum file size: 5MB
- Allowed file types: JPEG, PNG, WebP
- Maximum photos per facility: 12

## Component Integration

### PhotoUpload Component
Located in `src/components/PhotoUpload.tsx`
- Handles file uploads
- Provides drag and drop interface
- Shows upload progress
- Displays image previews
- Handles file validation
- Adapts UI based on verification status

### ImageCarousel Component
Located in `src/components/ImageCarousel.tsx`
- Handles different display modes based on verification:
  - Verified: Full slideshow with navigation
  - Unverified: Single image display
- Provides touch swipe support
- Shows navigation controls when appropriate
- Handles image transitions

### RehabCard Component
Located in `src/components/RehabCard.tsx`
- Integrates with ImageCarousel
- Shows verification badge
- Handles image display based on verification status
- Manages user interactions

## Firebase Configuration

### Firebase Initialization
Located in `src/lib/firebase.ts`
```typescript
import { getStorage } from 'firebase/storage';
// ... other imports

const storage = getStorage(app);
export { storage };
```

### Storage Rules
Located in `storage.rules`
```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024
        && request.resource.contentType.matches('image/.*')
        && request.resource.name.matches('facilities/[^/]+/.+');
    }
  }
}
```

### CORS Configuration
Located in `firebase.json`
```json
{
  "storage": {
    "rules": "storage.rules",
    "cors": [{
      "origin": [
        "https://beginrecovery.org",
        "http://localhost:3000",
        "http://localhost:5173"
      ],
      "method": ["GET", "POST", "PUT", "DELETE", "HEAD"],
      "maxAgeSeconds": 3600,
      "responseHeader": [
        "Content-Type",
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods",
        "Access-Control-Allow-Headers",
        "Cache-Control"
      ]
    }]
  }
}
```

## Storage Service
Located in `src/services/storage.ts`
- Manages file uploads to Firebase Storage
- Handles file validation
- Generates unique filenames
- Tracks upload progress
- Manages photo order

## Setup Process

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in the project directory:
```bash
firebase init
```
- Select "Storage: Configure security rules and indexes files for Storage"
- Use existing project: beginrecovery-bb288
- Accept default storage.rules file

4. Deploy storage rules and CORS configuration:
```bash
firebase deploy --only storage
```

## Component Usage Examples

### Create Listing Form
```typescript
<PhotoUpload
  facilityId={tempId}
  existingPhotos={photos}
  onPhotosChange={setPhotos}
  isVerified={false}
/>
```

### Edit Listing Modal
```typescript
<PhotoUpload
  facilityId={facility.id}
  existingPhotos={formData.images}
  onPhotosChange={handlePhotosChange}
  isVerified={facility.isVerified}
/>
```

### Facility Card Display
```typescript
<ImageCarousel 
  images={facility.images} 
  showNavigation={facility.images.length > 1}
  onImageClick={handleNavigation}
  paginationPosition="bottom"
  isVerified={facility.isVerified}
/>
```

## Error Handling
- File size validation
- File type validation
- Upload progress tracking
- Clear error messages
- Network error handling
- Authentication checks
- CORS error handling
- Verification status checks

## Security
- Public read access
- Authenticated write access
- Unique filenames to prevent collisions
- File type restrictions
- Size limitations
- CORS restrictions to allowed domains
- Verification status enforcement

## Troubleshooting

### CORS Issues
If you encounter CORS errors:
1. Verify the domain is listed in firebase.json CORS configuration
2. Ensure storage rules are deployed
3. Check authentication status
4. Verify file meets size and type restrictions

### Upload Fails
1. Check file size (max 5MB)
2. Verify file type (JPEG, PNG, WebP)
3. Ensure user is authenticated
4. Check network connection
5. Verify CORS configuration

### Images Not Displaying
1. Verify URL format
2. Check storage rules
3. Confirm file exists in storage
4. Check browser console for CORS errors
5. Verify verification status is correct

## Best Practices
1. Always validate files before upload
2. Use unique filenames
3. Organize files by facility ID
4. Handle errors gracefully
5. Show upload progress
6. Clean up unused images
7. Optimize images for web display
8. Maintain proper CORS configuration
9. Check verification status before displaying multiple images
10. Handle verification status changes properly

## Future Improvements
1. Image compression
2. Bulk upload optimization
3. Image cropping/editing
4. Automatic image optimization
5. CDN integration
6. Backup storage
7. Enhanced error reporting
8. Automated cleanup of unused images
9. Better handling of verification status changes
10. Improved image transition animations
