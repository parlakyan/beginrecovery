# Facility Claims System

The claims system allows facility owners to claim and verify their listings on BeginRecovery.

## Overview

Facilities can be in one of three claim states:
- `unclaimed`: No one has claimed ownership of the facility
- `claimed`: A user has successfully claimed ownership
- `disputed`: Another user has disputed the current ownership claim

## Claim Process

1. **Finding a Facility**
   - Users can search for their facility on the site
   - Unclaimed facilities show a "Claim This Listing" button
   - The claim button appears in two locations:
     - Top of the listing page
     - Contact box

2. **Submitting a Claim**
   - Required information:
     - Name and position at facility
     - Facility website
     - Work email address
     - Phone number

3. **Verification Methods**
   - **Automatic Verification**:
     - If the user's email domain matches the facility's website domain
     - Example: john@facilityx.com matches www.facilityx.com
     - Claim is automatically approved
   
   - **Manual Verification**:
     - If email domain doesn't match, claim goes to admin review
     - Admins review claims in the Claims tab of the admin dashboard

4. **After Claiming**
   - Claimed facilities can be:
     - Edited by the owner
     - Upgraded to verified status (paid)
     - Disputed by other users

## Disputes

1. **Filing a Dispute**
   - Users can dispute ownership of a claimed facility
   - Must provide reason for dispute
   - Facility status changes to "disputed"

2. **Dispute Resolution**
   - Admins review disputes in the Disputes tab
   - Can approve or reject the dispute
   - Must provide resolution notes
   - Original owner is notified of the decision

## Admin Dashboard

1. **Claims Tab**
   - View all pending and processed claims
   - Filter by status
   - Approve or reject claims
   - Add admin notes
   - View claim statistics

2. **Disputes Tab**
   - View active disputes
   - Review dispute reasons
   - Resolve disputes
   - Add resolution notes

## Verification Status

Separate from claim status, facilities can be:
- **Unverified** (free):
  - Basic listing information
  - Limited features
  
- **Verified** (paid):
  - Full feature access
  - Green verification badge
  - "Currently accepting patients" status
  - Facility logo display
  - Call and message buttons
  - Staff section
  - Certifications section

## Technical Implementation

1. **Database Collections**
   - `claims`: Stores claim records
   - `facilities`: Updated with claim status and owner ID

2. **Security Rules**
   - Only admins can approve/reject claims
   - Only facility owners can edit their listings
   - Anyone can submit a claim or dispute

3. **Email Verification**
   - Domain matching is case-insensitive
   - Subdomains are not considered matches
   - www. is stripped for comparison

## Best Practices

1. **For Facility Owners**
   - Use official facility email for automatic verification
   - Have facility website URL ready
   - Be prepared to verify position at facility

2. **For Admins**
   - Review claims promptly
   - Check provided contact information
   - Document reasons for rejections
   - Handle disputes with thorough investigation

3. **For Developers**
   - Always check claim status before allowing edits
   - Maintain audit trail of claim changes
   - Handle edge cases in domain matching
   - Implement proper error handling
