# Facility Import System

## Overview

The import system allows administrators to bulk import facilities from CSV files. The process is split into two phases:
1. Basic data import (immediate)
2. Address geocoding (background process)

## CSV Format

### Required Columns
- `Facility Name`: Full name of the facility
- `Facility Website`: Valid URL (optional)
- `Facility Address`: Complete address including street, city, state, and ZIP

### Example CSV
```csv
Facility Name,Facility Website,Facility Address
"Recovery Center A","https://example.com","123 Main St, City, State 12345"
"Recovery Center B","https://example.org","456 Oak Ave, Town, State 67890"
```

### Validation Rules
- Facility Name cannot be empty
- Facility Address cannot be empty
- Website URL must be valid if provided
- File must be UTF-8 encoded
- Headers must match exactly (case-sensitive)

## Import Process

### Phase 1: Basic Data Import
1. Upload CSV file
2. Validate file format and data
3. Create facility records with:
   - Basic information (name, website)
   - Admin ownership (claimable)
   - Approved moderation status
   - Pending geocoding status

### Phase 2: Address Processing
1. Process addresses in batches (50 at a time)
2. Geocode using Google Maps API
3. Handle match quality:
   - Exact matches: Update facility
   - Partial matches: Flag for review
   - Failed matches: Mark for manual entry

## Address Review

### Match Quality Levels
- **Exact**: Perfect match with Google Maps data
- **Partial**: Some components matched
- **None**: No match found

### Review Process
1. Access review page from Imports tab
2. View facilities needing review
3. Update addresses manually
4. Re-attempt geocoding
5. Confirm correct location

## Import Job Status

Status flow:
1. `pending`: Initial upload
2. `importing`: Basic data import
3. `geocoding`: Address processing
4. `completed`: All processing done
5. `failed`: Error occurred

## Progress Tracking

The system tracks:
- Total facilities
- Processed records
- Geocoded addresses
- Partial matches
- Failed geocoding
- Processing time

## Best Practices

### Data Preparation
1. Clean addresses:
   - Include full street address
   - Include city and state
   - Include ZIP code if possible
   - Remove special characters
   - Fix common abbreviations

2. Website URLs:
   - Include protocol (http:// or https://)
   - Verify URLs are active
   - Remove tracking parameters

3. Facility Names:
   - Use official names
   - Remove unnecessary suffixes
   - Consistent capitalization

### Import Process
1. Start with a small test batch
2. Monitor progress in admin dashboard
3. Review partial matches promptly
4. Document any special cases

## Error Handling

### CSV Errors
- Invalid format
- Missing required columns
- Malformed data
- Encoding issues

### Geocoding Errors
- Invalid addresses
- API limits
- Network issues
- Partial matches

### Recovery Steps
1. Review error logs
2. Fix data issues
3. Re-import failed records
4. Update addresses manually if needed

## Rate Limits

### Google Maps API
- Standard plan: 50 requests per second
- Batch processing with delays
- Automatic retry on failure
- Error tracking per address

### Import Processing
- 50 addresses per batch
- 1 second delay between batches
- Background processing
- Progress monitoring

## Security

- Only admins can import facilities
- All imported facilities are:
  * Owned by admin
  * Marked as claimable
  * Set to approved status
  * Available for verification

## Monitoring

Monitor through admin dashboard:
1. Import job status
2. Processing progress
3. Error rates
4. Address match quality
5. Review queue length

## Troubleshooting

### Common Issues
1. Address not found
   - Check format
   - Verify existence
   - Try alternative format

2. Partial matches
   - Review suggested matches
   - Check for typos
   - Verify with facility

3. Import failures
   - Check file format
   - Verify data integrity
   - Review error logs

### Support Steps
1. Check import job logs
2. Review error messages
3. Verify CSV format
4. Test with sample data
5. Contact technical support

## API Integration

The system uses:
- Google Maps Geocoding API
- Firebase Firestore
- CSV parsing library
