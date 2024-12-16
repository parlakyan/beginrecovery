# Photo & Logo Upload Documentation

## Overview
The upload system uses Firebase Cloud Storage to handle facility images and logos. It supports up to 12 photos per facility and one logo, with different display rules for verified and unverified listings.

## Important Notes on Logo Handling
When handling logo uploads and removals, there are a few critical points to remember:

1. Logo Field Values:
   - When setting a logo: Use the full URL string
   - When removing a logo: Use undefined, empty string (''), or null
   - The facilities service will handle all cases appropriately

2. Logo Removal Process:
   ```typescript
   // Any of these methods will work
   await facilitiesService.updateFacility(facilityId, {
     logo: undefined
   });
   // or
   await facilitiesService.updateFacility(facilityId, {
     logo: ''
   });
   // or
   await facilitiesService.updateFacility(facilityId, {
     logo: null
   });
   ```

3. Component State:
   - LogoUpload component uses undefined internally to indicate removal
   - Facilities service handles conversion between undefined/null/empty string
   - Storage cleanup is handled automatically

4. Creating New Facilities:
   ```typescript
   // Logo will only be included if it exists and is not empty
   const { id } = await facilitiesService.createFacility({
     name: 'Facility Name',
     // ... other required fields
     logo: logoUrl // Optional, will be handled appropriately
   });
   ```

## Verification-Based Features

### Verified (Paid) Listings
- Show all uploaded photos (up to 12)
- Show facility logo
- Full slideshow functionality
- Navigation controls (arrows and dots)
- Touch swipe support
- Photo grid in edit modal
- Multiple photo upload support

### Unverified (Free) Listings
- Show only the first photo
- No logo display
- No slideshow functionality
- Can still upload multiple photos (shown after upgrading)
- Basic image display
- Photos beyond the first are stored but not displayed

## Features
- Maximum 12 photos per facility
- One logo per facility
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
        ├── photos/
        │   └── [timestamp]-[randomString]-[filename]
        └── logo/
            └── [timestamp]-[randomString]-[filename]
```

Example:
```
gs://beginrecovery-bb288.appspot.com/facilities/abc123/photos/1684789123456-x7y9z2-photo.jpg
gs://beginrecovery-bb288.appspot.com/facilities/abc123/logo/1684789123456-x7y9z2-logo.jpg
```

## File Restrictions
- Maximum file size: 5MB
- Allowed file types: JPEG, PNG, WebP
- Maximum photos per facility: 12
- Maximum logo per facility: 1

## Component Integration

### LogoUpload Component
Located in `src/components/LogoUpload.tsx`
- Handles logo file uploads
- Provides drag and drop interface
- Shows upload progress
- Displays logo preview
- Handles file validation
- Manages logo removal and cleanup
- Returns undefined when logo is removed (handled by facilities service)

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

### ContactBox Component
Located in `src/components/ContactBox.tsx`
- Displays facility logo for verified listings
- Shows fallback icon when no logo
- Handles logo display based on verification status

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
```rules
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAdmin() {
      return request.auth != null && request.auth.token.role == 'admin';
    }

    function isOwner() {
      return request.auth != null && request.auth.token.role == 'owner';
    }

    function isValidImage() {
      return request.resource.size < 5 * 1024 * 1024 // 5MB max
        && request.resource.contentType.matches('image/.*'); // Only images
    }

    // Allow public read access to all files
    match /{allPaths=**} {
      allow read: if true;
    }

    // Admin folders - only admins can write
    match /licenses/{fileName} {
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    match /insurances/{fileName} {
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    match /locations/{fileName} {
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    // Facility files - admins and owners can write
    match /facilities/{facilityId}/{allPaths=**} {
      allow write: if request.auth != null 
        && (
          // Allow non-image files in temp directory
          request.path.matches('facilities/temp-.*') ||
          // Require image validation for permanent files
          isValidImage()
        )
        && (isAdmin() || isOwner());
      allow delete: if request.auth != null 
        && (isAdmin() || isOwner());
    }
  }
}
```

### Role-Based Access
- Public read access for all files
- Admin users can:
  - Write to all folders (facilities, licenses, insurances, locations)
  - Delete any files
  - Manage system-wide resources
- Owner users can:
  - Write to their facility folders
  - Upload photos and logos
  - Delete their facility files
- All writes require:
  - Authentication
  - Valid image file (5MB max, image types only)
  - Proper role permissions

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
- Handles file deletion
- Manages file moves between directories
- Handles non-existent files gracefully

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

### Logo Upload
```typescript
// In EditListingModal
const [logo, setLogo] = useState<string | undefined>(facility.logo);

const handleLogoChange = useCallback((newLogo: string | undefined) => {
  setLogo(newLogo);
}, []);

const onSubmit = async (data: EditListingForm) => {
  const updateData: Partial<Facility> = {
    // ... other fields
    logo // Facilities service handles undefined/null/empty string
  };
  await onSave(updateData);
};

return (
  <LogoUpload
    facilityId={facility.id}
    existingLogo={logo}
    onLogoChange={handleLogoChange}
  />
);
```

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
- File deletion errors
- File move errors
- Non-existent file handling

## Security
- Public read access
- Authenticated write access
- Unique filenames to prevent collisions
- File type restrictions
- Size limitations
- CORS restrictions to allowed domains
- Verification status enforcement
- Proper file cleanup
- Temp file handling

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

### Logo Removal Issues
1. Use undefined, empty string (''), or null - all are handled properly
2. Verify storage cleanup completed
3. Confirm database update succeeded
4. Check component state updates
5. Verify UI reflects changes

## Best Practices
1. Always validate files before upload
2. Use unique filenames
3. Organize files by facility ID and type
4. Handle errors gracefully
5. Show upload progress
6. Clean up unused images
7. Optimize images for web display
8. Maintain proper CORS configuration
9. Check verification status before displaying
10. Handle verification status changes properly
11. Clean up storage on file removal
12. Use proper file organization
13. Handle undefined/null/empty string consistently
14. Use temp directories for in-progress uploads

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
11. Logo resizing/cropping tools
12. Better file organization structure
13. Improved temp file handling
14. Enhanced file validation
