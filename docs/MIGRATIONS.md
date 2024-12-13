# Database Migrations

This document outlines the database migrations and collection structure changes.

## Legacy Collections Migration

The following legacy collections and fields are being migrated to new structures:

1. `pending_facilities` → `facilities` with `moderationStatus`
   - All pending facilities are moved to main facilities collection
   - Added `moderationStatus: 'pending'` field
   - Original pending_facilities collection is removed

2. `treatmentOptions` → `treatmentTypes`
   - Collection renamed to better reflect its purpose
   - Added standard fields (name, description, logo)
   - Updated all facility references

3. New Collections
   - Added `claims` collection for facility ownership claims
   - Added proper security rules and indexes

## Collection Structure

Current collection structure after migrations:

```
/facilities
  - id: string
  - name: string
  - ...other fields
  - moderationStatus: 'pending' | 'approved' | 'rejected' | 'archived'
  - claimStatus: 'unclaimed' | 'claimed' | 'disputed'
  - activeClaimId?: string

/claims
  - id: string
  - facilityId: string
  - userId: string
  - status: 'pending' | 'approved' | 'rejected' | 'disputed' | 'resolved'
  - ...other fields

/treatmentTypes (formerly treatmentOptions)
  - id: string
  - name: string
  - description: string
  - logo: string
  - createdAt: string
  - updatedAt: string

[other collections remain unchanged]
```

## Running Migrations

Migrations run automatically when the app starts. The process:

1. Checks for and migrates pending facilities
2. Updates treatment types collection
3. Updates facility references
4. Creates new collections if needed

To manually run migrations:

```typescript
import { migrateLegacyCollections } from '../scripts/migrateLegacyCollections';

// Run migrations
await migrateLegacyCollections();
```

## Verification

After migration:
1. All pending facilities should appear in main facilities list with correct status
2. Treatment types should be properly linked to facilities
3. Claims collection should be ready for use
4. No data loss from original collections

## Rollback

In case of issues:
1. Backup is stored in `_backup` collections
2. Use Firebase console to restore if needed
3. Contact admin for assistance

## Security Rules

Updated security rules handle:
- Claims collection access
- Facility ownership verification
- Admin-only operations
- Proper field validation
