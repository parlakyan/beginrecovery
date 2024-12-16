# Verification System Documentation

[Previous content until Upgrade Flow section remains unchanged...]

## Listing Creation Flow

### Initial Creation
1. User creates new facility listing
   - Basic information required
   - Logo upload is optional
   - Photos can be added
   - Created as unverified by default
   - Status set to 'pending' for moderation

### Verification Options
After creating the listing, users have two options:
1. Continue with Free Listing
   - Listing remains unverified
   - Awaits admin approval
   - Limited features available
   - Can upgrade to verified later

2. Complete Payment
   - Listing becomes verified immediately
   - Automatically approved
   - All premium features unlocked
   - Logo becomes visible if uploaded

### Status Management
- New listings start as unverified and pending
- Free listings require admin approval
- Paid listings are auto-approved
- Admin can manually change status
- Status changes trigger feature updates

## Upgrade Flow

### Initiation
1. Owner clicks "Upgrade to Verified" on facility card or listing
2. System stores facility context in sessionStorage
3. Payment page displays facility name and details
4. User can choose to:
   - Complete payment (becomes verified and approved)
   - Skip payment (remains unverified and pending)
5. Webhook processes payment if completed
6. Facility status updated accordingly


### Context Preservation
```typescript
// Store facility context
sessionStorage.setItem('facilityData', JSON.stringify({
  facilityId,
  facility: {
    id: string;
    name: string;
    // other facility data
  }
}));
```

### Navigation Handling
- Payment page shows facility name
- Cancel page maintains context
- "Try Again" returns to payment
- Fallback to account page
- Clear navigation paths

### Status Updates
- Automatic on successful payment
- Preserved during moderation
- Reverts on subscription cancellation
- Admin can manually toggle
- Logo visibility updates automatically

## Homepage Display

### Featured Treatment Centers
- Shows up to 24 featured facilities
- Displays facility logos for verified listings
- Prioritizes facilities based on user's location
- Horizontal carousel with 3 facilities per slide
- Smooth sliding transitions
- Location-aware messaging
- Navigation controls and pagination
- Requires approved moderation status
- Ordered by location proximity and rating

### Recent Treatment Centers
- Shows all approved facilities
- Excludes facilities with pending/rejected/archived status
- Ordered by rating and creation date
- Paginated with 12 facilities per page
- Shows logos only for verified listings

## Implementation Details

### Service Architecture
The verification system is implemented through modular services:

#### Facilities Service (`src/services/facilities/`)
- `verification.ts`: Handles verification status
  - Status updates
  - Feature toggling
  - Subscription management
- `moderation.ts`: Manages moderation workflow
  - Status changes
  - Admin controls
  - Content review
- `crud.ts`: Basic facility operations
  - Data updates
  - Status preservation
  - Field management

#### Licenses Service (`src/services/licenses.ts`)
- License management for verified facilities
- Integration with facility verification
- Admin controls for license types
- Logo management for licenses

#### Insurance Service (`src/services/insurances.ts`)
- Insurance provider management
- Integration with facility profiles
- Admin controls for providers
- Logo management for providers

### Verification Status
- Stored in facility document as `isVerified` boolean
- Updated via Stripe webhook on successful payment
- Preserved during moderation status changes
- Controls:
  - Logo visibility
  - License display
  - Insurance display
  - Premium features

### License Management
- Available only to verified facilities
- Managed through dedicated licenses service
- Admin can add/edit/remove license types
- Facility owners can select applicable licenses
- Displayed in Certifications section
- Includes:
  - License name
  - Description
  - Logo
  - Verification status

### Insurance Management
- Available to all facilities
- Enhanced display for verified listings
- Managed through dedicated insurance service
- Admin can add/edit/remove providers
- Facility owners can select accepted insurance
- Includes:
  - Provider name
  - Description
  - Logo
  - Verification status

### Logo Management
- Stored in Firebase Storage under facility ID
- Separate logo directory for each facility
- Automatic cleanup on removal
- URL stored in facility document
- Field removed when logo deleted
- Empty string used for removal (not undefined/null)

### Location Services
- Automatic user location detection
- Geocoding for facility addresses
- Location-based facility sorting
- Graceful fallback when location unavailable
- Error handling for incomplete address data
- Coordinates storage for precise mapping

### Component Behavior

#### LogoUpload
- Available to all listings
- Shows preview and upload progress
- Handles file validation
- Manages storage cleanup
- Only displayed for verified listings
- Uses empty string for removal

#### FeaturedCarousel
- Shows 3 facilities at a time
- Displays logos for verified listings
- Smooth sliding transitions
- Navigation controls
- Pagination indicators
- Location-aware display

#### RehabCard
- Shows verification badge
- Shows logo for verified listings
- Adapts photo display based on status
- Shows/hides premium features
- Handles subscription cancellation
- Maintains state during updates

#### ImageCarousel
- Shows all photos for verified listings
- Shows only first photo for unverified
- Handles navigation based on status

#### ContactBox
- Shows logo for verified listings
- Shows all contact options for verified
- Limited options for unverified
- Displays upgrade prompt for unverified

#### AddressAutocomplete
- Google Places integration
- Address validation
- Coordinates extraction
- Error handling for incomplete data
- Fallback for missing components

#### MapSection
- Uses coordinates for precise location
- Falls back to address if needed
- Loading states
- Error handling
- Responsive design

### State Management
- Verification status in facility document
- Logo URL and management
- Subscription status tracking
- Payment webhook handling
- Status change handling
- Location state management
- Address and coordinates storage
- Session storage for upgrade flow

## Verification Process

### Initial Setup
1. Create facility listing (unverified)
2. Complete basic information
3. Upload photos and logo
4. Submit for moderation

### Upgrade Process
1. Click "Upgrade to Verified" on facility card
2. System stores facility context
3. Payment page shows facility details
4. Process payment through Stripe
5. Webhook updates verification status
6. Features automatically unlock
   - Logo becomes visible
   - All photos displayed
   - Premium features enabled

### Status Changes
- Automatic on successful payment
- Preserved during moderation
- Reverts on subscription cancellation
- Admin can manually toggle
- Logo visibility updates automatically
- Proper state management during changes

## Testing Verification

### Test Cases
1. Verify unverified listing shows limited features
2. Verify paid listing shows all features
3. Test status changes via webhook
4. Test status preservation during moderation
5. Test feature visibility changes
6. Test logo visibility changes
7. Test logo removal and cleanup
8. Test location-based sorting
9. Test carousel functionality
10. Test address validation
11. Test map display
12. Test coordinates accuracy
13. Test license selection and display
14. Test insurance provider selection
15. Test license logo management
16. Test insurance logo management
17. Test license admin controls
18. Test insurance admin controls
19. Test upgrade flow navigation
20. Test context preservation
21. Test cancellation handling

### Component Testing
1. RehabCard display modes
2. Logo upload and removal
3. ImageCarousel behavior
4. ContactBox options
5. Feature visibility
6. Badge display
7. Location detection
8. Carousel navigation
9. Address autocomplete
10. Map rendering
11. Error handling
12. License selection interface
13. Insurance selection interface
14. CertificationsSection display
15. License logo handling
16. Insurance logo handling
17. Payment flow navigation
18. Context preservation
19. State management

## Security

### Access Control
- Role-based permissions:
  - Admin users:
    * Full access to all storage folders
    * Can write/delete system files (licenses, insurances, locations)
    * Can manage any facility's files
    * Can toggle verification status
  - Owner users:
    * Can write/delete files in their facility folders
    * Can upload photos and logos
    * Access limited to their own facilities
    * Must have proper role claims in auth token
  - All users:
    * Public read access to all files
    * Must be authenticated for writes
    * Must submit valid image files (5MB max)

### Storage Rules
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
        && isValidImage()
        && (isAdmin() || isOwner());
      allow delete: if request.auth != null 
        && (isAdmin() || isOwner());
    }
  }
}
```

### Status Protection
- Server-side verification
- Webhook authentication
- Status change logging
- Access control checks
- Storage rules enforcement
- Role-based permissions
- Token validation
- Path validation
- Session data protection

## Best Practices

### Development
1. Always check isVerified prop
2. Handle both states gracefully
3. Clear status indicators
4. Proper error handling
5. Status change validation
6. Location fallback handling
7. Address validation
8. Coordinates verification
9. Clean up resources on removal
10. Preserve context during navigation
11. Handle session storage properly
12. Use empty string for logo removal

### UI/UX
1. Clear verification indicators
2. Consistent premium features
3. Smooth status transitions
4. Clear upgrade prompts
5. Status-appropriate messaging
6. Location-aware content
7. Loading states
8. Error messages
9. Logo visibility rules
10. Clear navigation paths
11. Context preservation
12. Facility identification

### Testing
1. Test both states
2. Verify feature access
3. Check status transitions
4. Validate security
5. Test edge cases
6. Test location scenarios
7. Test address input
8. Test map display
9. Test logo management
10. Test navigation flows
11. Test context preservation
12. Test state management

## Troubleshooting

### Common Issues
1. Features not updating after payment
2. Status inconsistencies
3. Feature visibility issues
4. Payment webhook failures
5. Location detection issues
6. Address validation errors
7. Map display problems
8. Coordinate accuracy
9. Logo not displaying
10. Logo removal issues
11. Navigation errors
12. Context loss
13. Session storage issues

### Solutions
1. Check webhook logs
2. Verify database status
3. Clear cache/reload
4. Check security rules
5. Validate payment status
6. Check location permissions
7. Verify address data
8. Confirm coordinates
9. Check storage paths
10. Verify file cleanup
11. Check session storage
12. Validate navigation state
13. Review context data

## Future Improvements
1. Granular feature control
2. Multiple tier support
3. Trial periods
4. Bulk verification
5. Enhanced analytics
6. Advanced location filtering
7. Improved address validation
8. Better map interactions
9. Enhanced logo management
10. Automated image optimization
11. Enhanced license verification
12. Automated license validation
13. Insurance verification API
14. Provider network integration
15. Real-time status updates
16. Improved navigation flows
17. Better context management
18. Enhanced session handling
19. Smarter state preservation
20. Better error recovery
