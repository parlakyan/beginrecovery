# Migration Guide

This guide explains how to migrate legacy data to the new collection structure.

## Quick Start

1. Log in as an admin
2. Go to Admin Dashboard
3. Click on the "Migrations" tab
4. Review the collection statistics
5. Click "Start Migration" to begin

## What Gets Migrated

The migration process handles:

1. `pending_facilities` → `facilities` with `moderationStatus`
   - All pending facilities are moved to main collection
   - Status is set to 'pending'
   - Original collection is emptied

2. `treatmentOptions` → `treatmentTypes`
   - All options are moved to new collection
   - References in facilities are updated
   - Original collection is emptied

3. New Collections Setup
   - `claims` collection is created
   - Security rules are updated
   - Indexes are created if needed

## Monitoring Progress

The Migrations page shows:
- Real-time collection statistics
- Migration log with detailed progress
- Success/error messages
- Collection status (legacy vs current)

## Automatic Migration

The system will attempt to run migrations automatically when:
1. An admin user logs in
2. The app starts with an admin session
3. Required collections are missing

## Manual Migration

To run migrations manually:

1. Navigate to Admin Dashboard
2. Go to Migrations tab
3. Check collection statistics
4. Click "Start Migration"
5. Monitor the migration log
6. Verify completion status

## Verification

After migration, verify:

1. Collection Statistics
   - Legacy collections should be empty
   - Data should appear in new collections
   - Document counts should match

2. Application Features
   - Facility moderation works
   - Treatment types display correctly
   - Claims system functions

## Troubleshooting

If you encounter issues:

1. Check the migration log for errors
2. Verify Firebase permissions
3. Ensure admin privileges
4. Check network connectivity

## Rollback

To rollback migrations:

1. Use Firebase Console
2. Restore from backup
3. Contact system administrator

## Security

The migration process:
- Only runs for admin users
- Requires proper Firebase permissions
- Maintains data integrity
- Creates backups automatically

## Need Help?

If you need assistance:
1. Check the migration log
2. Review error messages
3. Contact technical support
