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
3. Facility logo display
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

## Homepage Display

### Featured Treatment Centers
- Shows up to 24 featured facilities
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

## Implementation Details

### Verification Status
- Stored in facility document as `isVerified` boolean
- Updated via Stripe webhook on successful payment
- Preserved during moderation status changes

### Location Services
- Automatic user location detection
- Geocoding for facility addresses
- Location-based facility sorting
- Graceful fallback when location unavailable

### Component Behavior

#### FeaturedCarousel
- Shows 3 facilities at a time
- Smooth sliding transitions
- Navigation controls
- Pagination indicators
- Location-aware display

#### RehabCard
- Shows verification badge
- Adapts photo display based on status
- Shows/hides premium features

#### ImageCarousel
- Shows all photos for verified listings
- Shows only first photo for unverified
- Handles navigation based on status

#### ContactBox
- Shows all contact options for verified
- Limited options for unverified
- Displays upgrade prompt for unverified

### State Management
- Verification status in facility document
- Subscription status tracking
- Payment webhook handling
- Status change handling
- Location state management

## Verification Process

### Initial Setup
1. Create facility listing (unverified)
2. Complete basic information
3. Upload photos
4. Submit for moderation

### Upgrade Process
1. Click "Upgrade to Verified"
2. Process payment through Stripe
3. Webhook updates verification status
4. Features automatically unlock

### Status Changes
- Automatic on successful payment
- Preserved during moderation
- Reverts on subscription cancellation
- Admin can manually toggle

## Testing Verification

### Test Cases
1. Verify unverified listing shows limited features
2. Verify paid listing shows all features
3. Test status changes via webhook
4. Test status preservation during moderation
5. Test feature visibility changes
6. Test location-based sorting
7. Test carousel functionality

### Component Testing
1. RehabCard display modes
2. ImageCarousel behavior
3. ContactBox options
4. Feature visibility
5. Badge display
6. Location detection
7. Carousel navigation

## Security

### Access Control
- Public read access
- Owner write access
- Admin full control
- Payment verification

### Status Protection
- Server-side verification
- Webhook authentication
- Status change logging
- Access control checks

## Best Practices

### Development
1. Always check isVerified prop
2. Handle both states gracefully
3. Clear status indicators
4. Proper error handling
5. Status change validation
6. Location fallback handling

### UI/UX
1. Clear verification indicators
2. Consistent premium features
3. Smooth status transitions
4. Clear upgrade prompts
5. Status-appropriate messaging
6. Location-aware content

### Testing
1. Test both states
2. Verify feature access
3. Check status transitions
4. Validate security
5. Test edge cases
6. Test location scenarios

## Troubleshooting

### Common Issues
1. Features not updating after payment
2. Status inconsistencies
3. Feature visibility issues
4. Payment webhook failures
5. Location detection issues

### Solutions
1. Check webhook logs
2. Verify database status
3. Clear cache/reload
4. Check security rules
5. Validate payment status
6. Check location permissions

## Future Improvements
1. Granular feature control
2. Multiple tier support
3. Trial periods
4. Bulk verification
5. Enhanced analytics
6. Advanced location filtering
