# Verification System Documentation

## Overview
The Recovery Directory platform uses a two-tier system for facility listings:
- Verified (Paid) listings
- Unverified (Free) listings

## Listing Tiers

### Verified (Paid) Listings
Features available to verified listings:
1. Green "Verified" badge
2. "Currently accepting patients" status indicator
3. Facility logo display and management
   - Upload custom logo
   - Logo appears in contact box
   - Logo management in edit modal
   - Logo removal with storage cleanup
4. Homepage showcase based on location
5. Certifications section
6. Staff section
7. Call and Message buttons
8. Website and Message buttons
9. Full photo gallery with slideshow
10. Featured in search results

### Unverified (Free) Listings
Basic features available to free listings:
1. Basic facility information
2. Single photo display
3. Standard search listing
4. Basic contact information
5. No logo display (logo can be uploaded but won't be shown until verified)

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

## Verification Process

### Initial Setup
1. Create facility listing (unverified)
2. Complete basic information
3. Upload photos and logo
4. Submit for moderation

### Upgrade Process
1. Click "Upgrade to Verified"
2. Process payment through Stripe
3. Webhook updates verification status
4. Features automatically unlock
   - Logo becomes visible
   - All photos displayed
   - Premium features enabled

### Status Changes
- Automatic on successful payment
- Preserved during moderation
- Reverts on subscription cancellation
- Admin can manually toggle
- Logo visibility updates automatically

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

## Security

### Access Control
[Previous content remains, plus:]
- License management restrictions
- Insurance management restrictions
- Logo access control
- Admin-only controls

[Rest of the previous content remains the same...]

- Public read access
- Owner write access
- Admin full control
- Payment verification
- Storage access control

### Status Protection
- Server-side verification
- Webhook authentication
- Status change logging
- Access control checks
- Storage rules enforcement

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
