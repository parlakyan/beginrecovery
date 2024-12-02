# Photo Upload Documentation

## Overview
The photo upload system uses Firebase Cloud Storage to handle facility images. It supports up to 12 photos per facility, with different display rules for verified and unverified listings.

## Features
- Maximum 12 photos per facility
- Verified listings: Show all uploaded photos
- Unverified listings: Show only the first photo
- Drag and drop support
- Progress tracking
- File validation
- Responsive image grid display

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

## Components

### PhotoUpload Component
Located in `src/components/PhotoUpload.tsx`
- Handles file uploads
- Provides drag and drop interface
- Shows upload progress
- Displays image previews
- Handles file validation

### Storage Service
Located in `src/services/storage.ts`
- Manages file uploads to Firebase Storage
- Handles file validation
- Generates unique filenames
- Tracks upload progress

## Firebase Configuration

### Storage Rules
Located in `storage.rules`
```
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Project Configuration
Located in `firebase.json`
```json
{
  "storage": {
    "rules": "storage.rules"
  }
}
```

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

4. Deploy storage rules:
```bash
firebase deploy --only storage
```

## Usage in Components

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

## Image Display

### ImageCarousel Component
Located in `src/components/ImageCarousel.tsx`
- Shows all photos for verified listings
- Shows only the first photo for unverified listings
- Provides navigation controls for multiple images
- Supports touch swipe gestures

## Error Handling
- File size validation
- File type validation
- Upload progress tracking
- Clear error messages
- Network error handling
- Authentication checks

## Security
- Public read access
- Authenticated write access
- Unique filenames to prevent collisions
- File type restrictions
- Size limitations

## Best Practices
1. Always validate files before upload
2. Use unique filenames
3. Organize files by facility ID
4. Handle errors gracefully
5. Show upload progress
6. Clean up unused images
7. Optimize images for web display

## Troubleshooting
1. Upload fails:
   - Check file size (max 5MB)
   - Verify file type (JPEG, PNG, WebP)
   - Ensure user is authenticated
   - Check network connection

2. Images not displaying:
   - Verify URL format
   - Check storage rules
   - Confirm file exists in storage

3. CORS issues:
   - Storage rules handle CORS configuration
   - No additional CORS setup needed

## Future Improvements
1. Image compression
2. Bulk upload optimization
3. Image cropping/editing
4. Automatic image optimization
5. CDN integration
6. Backup storage
