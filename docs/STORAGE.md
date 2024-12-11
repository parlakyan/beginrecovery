# Storage System Documentation

## Overview
The Recovery Directory platform uses Firebase Cloud Storage for managing facility images and logos. The storage system is designed to handle different types of files with specific organization and access patterns.

## Storage Structure

### Base Organization
```
gs://beginrecovery-bb288.appspot.com/
├── facilities/
│   └── [facilityId]/
│       ├── photos/
│       │   └── [timestamp]-[randomString]-[filename]
│       └── logo/
│           └── [timestamp]-[randomString]-[filename]
├── licenses/
│   └── [filename]
├── insurances/
│   └── [filename]
├── locations/
│   └── [filename]
├── conditions/
│   └── [filename]
├── substances/
│   └── [filename]
├── therapies/
│   └── [filename]
└── treatmentTypes/
    └── [filename]
```

### File Naming Convention
- Timestamp prefix for uniqueness
- Random string to prevent collisions
- Original filename (sanitized)
- Example: `1684789123456-x7y9z2-logo.jpg`

## Storage Rules

### Security Rules
Located in `storage.rules`:
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

    match /conditions/{fileName} {
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    match /substances/{fileName} {
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    match /therapies/{fileName} {
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    match /treatmentTypes/{fileName} {
      allow write: if isAdmin() && isValidImage();
      allow delete: if isAdmin();
    }

    // Facility files - admins and owners can write
    match /facilities/{facilityId}/{allPaths=**} {
      allow write: if request.auth != null 
        && isValidImage()
        && (isAdmin() || isOwner());
      allow delete: if request.auth != null 
        && (isAdmin() || isOwner());
    }
  }
}
```

### Access Control
- Public read access for all files
- Role-based write access:
  - Admins can write to all folders
  - Owners can write to facility folders
  - All writes require authentication
- Size limit: 5MB per file
- Image files only (JPEG, PNG, WebP)
- Structured path validation

## File Management

### Upload Process
1. File validation
   - Size check (5MB limit)
   - Type check (images only)
   - Name sanitization
2. Path generation
   - Facility ID check
   - Directory structure
   - Unique filename
3. Upload with metadata
   - Content type
   - Cache control
   - Progress tracking
4. Role verification
   - Admin access for system files
   - Owner access for facility files


### File Removal
1. Delete from storage
   - Remove file
   - Clean up directory
2. Update database
   - Remove reference
   - Update timestamps
3. Handle errors
   - Log failures
   - Retry if needed

### File Moving
1. Download original
2. Upload to new location
3. Delete original
4. Update references
5. Handle errors

## Storage Service

### Core Methods
```typescript
interface StorageService {
  validateFile(file: File): string | null;
  uploadImage(file: File, path: string): Promise<UploadResult>;
  uploadImages(files: File[], path: string): Promise<UploadResult[]>;
  moveFiles(fromPath: string, toPath: string): Promise<MoveFilesResult>;
  deleteFiles(path: string): Promise<void>;
}
```

### File Types
```typescript
interface UploadResult {
  url?: string;
  error?: string;
}

interface MoveFilesResult {
  movedFiles: {
    oldUrl: string;
    newUrl: string;
  }[];
}
```

## Integration Points

### Component Integration
- LogoUpload component
- PhotoUpload component
- ImageCarousel component
- EditListingModal
- CreateListing page

### Service Integration
- Facilities service
- Auth service
- Verification system
- Moderation system

## Error Handling

### Upload Errors
- File size exceeded
- Invalid file type
- Network issues
- Auth errors
- Path errors

### Deletion Errors
- File not found
- Permission denied
- Network issues
- Reference errors

### Move Errors
- Source missing
- Destination error
- Network issues
- Auth timeout

## Best Practices

### File Organization
1. Use consistent paths
2. Maintain directory structure
3. Clean up unused files
4. Handle temporary files
5. Validate paths

### Error Handling
1. Validate before upload
2. Handle network errors
3. Clean up on failure
4. Log errors properly
5. Provide user feedback

### Performance
1. Track upload progress
2. Handle large files
3. Optimize storage usage
4. Clean up regularly
5. Cache appropriately

### Security
1. Validate file types
2. Check permissions
3. Sanitize filenames
4. Limit file sizes
5. Secure paths

## Monitoring and Maintenance

### Monitoring
1. Storage usage
2. Upload success rates
3. Error rates
4. Access patterns
5. Performance metrics

### Maintenance
1. Regular cleanup
2. Path validation
3. Error checking
4. Performance optimization
5. Security updates

## Common Issues

### Upload Issues
1. File too large
2. Invalid type
3. Network timeout
4. Auth expired
5. Path error

### Solutions
1. Check file size
2. Validate file type
3. Retry upload
4. Refresh auth
5. Verify paths

## Future Improvements

### Short Term
1. Better error handling
2. Progress tracking
3. Retry mechanism
4. Better cleanup
5. Enhanced validation

### Long Term
1. CDN integration
2. Image optimization
3. Backup system
4. Analytics integration
5. Advanced caching

## Testing

### Unit Tests
```typescript
describe('StorageService', () => {
  it('validates files correctly', () => {
    // Test file validation
  });

  it('handles uploads properly', async () => {
    // Test file upload
  });

  it('manages deletions correctly', async () => {
    // Test file deletion
  });
});
```

### Integration Tests
```typescript
describe('Storage Integration', () => {
  it('works with facility service', async () => {
    // Test service integration
  });

  it('handles component interaction', async () => {
    // Test component integration
  });
});
```

## Deployment

### Configuration
1. Set up Firebase project
2. Configure storage rules
3. Set up CORS
4. Configure cache
5. Set up monitoring

### Verification
1. Test uploads
2. Verify paths
3. Check permissions
4. Validate cleanup
5. Monitor performance

## Documentation Updates
Keep this documentation updated when:
1. Adding new features
2. Changing paths
3. Updating rules
4. Modifying processes
5. Adding integrations
