# Facility Claims System

## Overview

The claims system allows legitimate facility owners to claim and manage their listings. Claims are only available for:
- Facilities owned by admin (ownerId = 'admin')
- Facilities with no owner (ownerId = null)
- Facilities imported through bulk import

## Claim Process

1. Visibility
   - Claim button appears only on admin-owned or unowned facilities
   - Button shows in two locations:
     * Top-right of facility image carousel
     * Contact box (if facility is claimable)

2. Claim Submission
   - User must be logged in
   - Required information:
     * Name
     * Position at facility
     * Work email
     * Phone number
     * Facility website

3. Verification
   - Automatic approval if work email matches facility domain
   - Manual admin review for non-matching emails
   - Email verification required

## Claim Statuses

- `unclaimed`: Default for admin-owned facilities
- `claimed`: Successfully claimed by an owner
- `disputed`: Another user has disputed ownership
- `resolved`: Dispute resolved by admin

## Disputes

1. Disputing a Claim
   - Available for claimed facilities
   - Requires reason and evidence
   - Sets facility status to 'disputed'

2. Resolution
   - Admin reviews dispute
   - Can approve original claim or new dispute
   - Updates facility ownership accordingly

## Admin Dashboard

1. Claims Tab
   - List of pending and processed claims
   - Auto-approval status
   - Manual review options
   - Claim statistics

2. Disputes Tab
   - Active disputes
   - Resolution interface
   - Dispute history

## Database Structure

```typescript
interface Facility {
  ownerId: string | null;    // 'admin' for claimable facilities
  claimStatus: 'unclaimed' | 'claimed' | 'disputed';
  activeClaimId?: string;    // Reference to active claim
}

interface FacilityClaim {
  id: string;
  facilityId: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected' | 'disputed' | 'resolved';
  // ... other fields
}
```

## Security Rules

- Anyone can read claims
- Only authenticated users can submit claims
- Only claim owner or admin can update claims
- Only admins can delete claims

## Bulk Import

When importing facilities:
1. Set ownerId to 'admin'
2. Set claimStatus to 'unclaimed'
3. Leave activeClaimId as null

## Best Practices

1. Ownership Verification
   - Always verify email domain when possible
   - Request additional verification for non-matching emails
   - Document verification decisions

2. Dispute Handling
   - Review all evidence thoroughly
   - Contact both parties if needed
   - Document resolution process

3. Data Management
   - Keep claim history for audit purposes
   - Regular cleanup of resolved claims
   - Monitor for abuse patterns

## API Endpoints

Claims-related operations are handled through Firebase:
- Collection: 'claims'
- Security rules in firebase.rules
- Automatic timestamps for auditing
