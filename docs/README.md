# Recovery Directory Documentation

## Project Overview & Target Audience
The Recovery Directory is a platform connecting individuals seeking rehabilitation services with treatment facilities. The platform serves:
- Users seeking rehabilitation services (free browsing)
- Facility owners offering treatment services
- Treatment professionals and staff

### Business Model
- Free browsing for all users
- Two-tier listing system:
  1. Free (Unverified) listings with basic features
  2. Paid (Verified) listings with premium features

### Verified Listing Features
1. Green "Verified" badge
2. "Currently accepting patients" status with green dot in contact card
3. Facility logo display in contact card
4. Homepage showcase based on user's location
5. Certifications section
6. Staff section
7. Call and Message buttons in contact card
8. Website and Message buttons in contact box

### Homepage Sections
- Recent Treatment Centers: Shows all facilities except Pending/Rejected/Archived
- Featured Treatment Centers: Shows Featured facilities only

### Facility Collections
Complete list of facility-related collections:
- Highlights
- Amenities
- Treatment Types
- Substances We Treat
- Insurance Accepted
- Accreditation
- Languages

## Target Audience Considerations

### Users Seeking Treatment
- Clear, accessible information
- Trustworthy presentation
- Easy navigation
- Simple search and filtering
- Transparent verification status
- Professional but approachable tone
- Focus on helping find the right facility

### Facility Owners
- Professional presentation
- Clear value proposition
- Easy listing management
- Premium features showcase
- Business-focused language
- ROI-driven messaging
- Quality differentiation through verification

### Treatment Professionals
- Clinical accuracy
- Professional terminology
- Evidence-based approach
- Certification emphasis
- Industry-standard compliance
- Professional networking
- Staff credentials display

## Development Guidelines

### Design Principles
1. Follow established patterns in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
2. Reuse existing components where possible
3. Maintain consistent styling and UX
4. Ask before creating new patterns

### Code Organization
- Components in `src/components/`
- Services in `src/services/`
- Pages in `src/pages/`
- Types in `src/types.ts`
- Utilities in `src/utils/`

### Feature Implementation
1. Review existing documentation
2. Check for similar features
3. Follow established patterns
4. Update documentation
5. Add tests

### Documentation Updates
Keep documentation updated when:
1. Adding new features
2. Changing existing features
3. Updating dependencies
4. Modifying processes
5. Adding integrations

## Premium Design Standards

### Visual Quality
1. High-quality imagery
2. Professional typography
3. Clean, modern layouts
4. Consistent branding
5. Premium color palette

### User Experience
1. Intuitive navigation
2. Smooth transitions
3. Responsive interactions
4. Clear feedback
5. Professional animations

### Content Quality
1. Professional copywriting
2. Clear messaging
3. Accurate information
4. Consistent tone
5. Proper terminology

## Verification System

### Listing Tiers
1. Verified (Paid) Features:
   - Green "Verified" badge
   - "Currently accepting patients" status
   - Facility logo display
   - Homepage showcase
   - Certifications section
   - Staff section
   - Enhanced contact options
   - Full photo gallery

2. Unverified (Free) Features:
   - Basic facility information
   - Single photo display
   - Standard search listing
   - Basic contact information

## Storage System

### Folder Structure
```
gs://beginrecovery-bb288.appspot.com/
├── facilities/
├── licenses/
├── insurances/
├── locations/
├── conditions/
├── substances/
├── therapies/
└── treatmentTypes/
```

### Access Control
- Public read access
- Admin write access to system folders
- Owner write access to facility folders
- Size and type restrictions

## Component Library

### Core Components
- AdminEntryCard - Consistent admin entry display with larger photo (aspect-[3/2])
- Button - Base button component
- Tag - Display tags and badges
- MultiSelect - Multiple selection dropdown
- ImageCarousel - Photo display component
- DropdownSelect - Single selection component
- Breadcrumb - Navigation component
- Tabs - Content organization

### Admin Components
- AdminLogoUpload - Logo upload with token refresh
- EditListingModal - Facility editing
- LocationBrowser - Location management
- FilterBar - Search and filtering

### Feature Components
- ConditionsSection - Display conditions
- TherapiesSection - Display therapies
- SubstancesSection - Display substances
- TreatmentTypesSection - Display treatment types
- CertificationsSection - Display certifications
- LanguagesSection - Display languages
- AmenitiesSection - Display amenities

### Layout Components
- Header - Main navigation
- Footer - Site footer
- ContactBox - Facility contact information
- FacilityDetailsSection - Facility information display

## UI/UX Standards

### Layout Guidelines
1. DO NOT change layouts unless specifically requested
2. Maintain consistent spacing and alignment
3. Follow responsive design patterns
4. Use established grid systems
5. Keep consistent component sizing

### Visual Hierarchy
1. Clear section headings
2. Consistent typography
3. Proper use of white space
4. Important information prominence
5. Clear call-to-actions

### Component Patterns
1. Large photo display (aspect-[3/2]) for admin entries
2. Consistent card layouts
3. Standard form elements
4. Uniform button styles
5. Consistent icon usage

## Documentation Maintenance

### Update Process
1. Document changes immediately
2. Review related documentation
3. Update all affected files
4. Verify documentation links
5. Test code examples

### Quality Checks
1. Verify accuracy
2. Check completeness
3. Test code samples
4. Review formatting
5. Validate links

### Version Control
1. Track documentation versions
2. Note breaking changes
3. Maintain changelog
4. Archive old versions
5. Update dependencies

## Best Practices

### Development
1. Follow TypeScript types
2. Use existing components
3. Write clear documentation
4. Add proper error handling
5. Include tests

### UI/UX
1. Follow design system
2. Maintain consistency
3. Consider accessibility
4. Handle loading states
5. Show clear feedback

### Performance
1. Optimize images
2. Handle errors gracefully
3. Add loading states
4. Cache appropriately
5. Clean up resources

## Documentation Structure

### Core Documentation
- [Design System](./DESIGN_SYSTEM.md) - UI guidelines, colors, typography
- [Components](./COMPONENTS.md) - Reusable UI components
- [Services](./SERVICES.md) - Backend services and API integration
- [Verification](./VERIFICATION.md) - Listing verification system
- [Roles](./ROLES.md) - User roles and permissions
- [Photo Upload](./PHOTO_UPLOAD.md) - Image handling
- [Payments](./PAYMENTS.md) - Stripe integration
- [Moderation](./MODERATION.md) - Content moderation
- [Google Maps](./GOOGLE_MAPS.md) - Maps integration
- [Analytics](./ANALYTICS.md) - Tracking and metrics
- [API](./API.md) - API documentation
- [Deployment](./DEPLOYMENT.md) - Deployment process
- [Storage](./STORAGE.md) - File management
- [Testing](./TESTING.md) - Testing guidelines

### Additional Resources
- Project README (/README.md)
- Contributing Guidelines (/CONTRIBUTING.md)
- [Extended Documentation](https://docs.google.com/document/d/1NgW_LTwVEW97hsOhWy7xrnWbgU1eACm8o4lxZr4LG4A/edit?tab=t.0#heading=h.vz7ym8e0k55j)

## Getting Started

### New Task Checklist
1. Review relevant documentation
2. Check existing components
3. Follow established patterns
4. Update documentation
5. Add necessary tests

### Documentation Navigation
1. Start with core documentation
2. Check component docs for UI work
3. Review technical docs for backend
4. Update relevant documentation
5. Add new documentation if needed

## Rules & Standards

### Development Rules
1. Stay coherent with existing code
2. Ask before establishing new patterns
3. Keep documentation updated
4. Follow TypeScript types
5. Add proper error handling

### Design Rules
1. Follow design system
2. Use existing components
3. Maintain consistency
4. Consider accessibility
5. Show clear feedback

### Documentation Rules
1. Keep docs up to date
2. Follow existing structure
3. Include clear examples
4. Add implementation details
5. Update related docs

## Critical Development Rules

### Code Rules
1. NEVER truncate code - all code must be complete
2. ALWAYS document code with comments
3. PRESERVE existing comments when rewriting code
4. KEEP all documentation up to date
5. FOLLOW established patterns for new features

### Component Guidelines
1. CHECK existing components before creating new ones
2. REUSE components whenever possible
3. ASK before creating new components
4. MAINTAIN consistent styling
5. FOLLOW component documentation

## Recent Updates
- Added AdminEntryCard component for consistent admin UI
- Updated storage rules for new folders
- Added logo support for TreatmentTypes
- Standardized UI across admin sections
- Added token refresh for secure uploads

## Deployment

### Process
- Deploy via GitHub desktop app to Netlify
- All environment variables set in Netlify
- Follow deployment documentation

Remember: This documentation will be continuously updated as new practices and standards are introduced. Always check for the latest guidelines and ask before establishing new patterns.
