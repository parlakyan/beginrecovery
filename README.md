# Recovery Directory Project

## Project Overview
A comprehensive platform connecting individuals seeking rehabilitation services with treatment facilities. The platform offers both free (Unverified) and paid (Verified) listings, with different feature sets for each tier.

## Documentation Navigation

### 1. Getting Started
- [Project Setup & Technical Overview](./README.md)
- [Development Guidelines & Standards](./docs/README.md)
- [Contributing Guidelines](./CONTRIBUTING.md)

### 2. Core Systems
- [Design System](./docs/DESIGN_SYSTEM.md) - UI guidelines, colors, typography
- [Verification System](./docs/VERIFICATION.md) - Listing verification and features
- [Payment System](./docs/PAYMENTS.md) - Stripe integration and subscriptions
- [Storage System](./docs/STORAGE.md) - File management and organization
- [Photo Upload System](./docs/PHOTO_UPLOAD.md) - Image handling and processing

### 3. Features & Components
- [Components Guide](./docs/COMPONENTS.md) - Reusable UI components
- [Services Documentation](./docs/SERVICES.md) - Backend services
- [User Roles & Permissions](./docs/ROLES.md) - Access control
- [Content Moderation](./docs/MODERATION.md) - Content review system
- [Maps Integration](./docs/GOOGLE_MAPS.md) - Location services

### 4. Development Tools
- [API Documentation](./docs/API.md) - API endpoints and usage
- [Analytics & Tracking](./docs/ANALYTICS.md) - Usage metrics
- [Testing Guidelines](./docs/TESTING.md) - Testing practices
- [Deployment Process](./docs/DEPLOYMENT.md) - Deployment workflow

### 5. Additional Systems
- [Import System](./docs/IMPORTS.md) - Facility data imports
- [Claims System](./docs/CLAIMS.md) - Facility claiming process
- [Migration System](./docs/MIGRATIONS.md) - Data migrations
- [Filters & Fields](./docs/FILTERS_AND_FIELDS.md) - Search and filtering

## Listing Tiers

### Verified (Paid) Listings
Features available to verified listings:
1. Full photo gallery with slideshow (up to 12 photos)
2. Green "Verified" badge
3. "Currently accepting patients" status indicator
4. Facility logo display and management
   - Custom logo upload
   - Logo appears in contact box
   - Logo management in edit modal
5. Homepage showcase based on location
6. Certifications section
7. Staff section
8. Call and Message buttons
9. Website link
10. Featured in search results

[View Detailed Verification Documentation](./docs/VERIFICATION.md)

### Unverified (Free) Listings
Basic features available to free listings:
1. Basic facility information
2. Single photo display
3. Standard search listing
4. Basic contact information
5. Logo can be uploaded but won't display until verified

[View Free Listing Features](./docs/VERIFICATION.md#unverified-free-listings)

## Homepage Sections

### Featured Treatment Centers
- Shows up to 24 featured facilities
- Displays facility logos for verified listings
- Prioritizes facilities based on user's location
- Horizontal carousel with 3 facilities per slide
- Smooth sliding transitions
- Location-aware messaging
- Navigation controls and pagination

### Recent Treatment Centers
- Shows all approved facilities
- Excludes pending/rejected/archived facilities
- Paginated grid layout
- Filter and search capabilities
- Shows logos only for verified listings

[View Homepage Implementation](./docs/components/feature.md)

## Setup Instructions

### Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Firebase account
- Stripe account
- Firebase CLI (for storage configuration)
- Google Maps API key (for location services)

### Installation Steps

1. Clone the Repository
```bash
git clone <your-repo-url>
cd recovery-directory
```

2. Install Dependencies
```bash
npm install
```

3. Environment Configuration
Create a `.env` file with:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=
VITE_STRIPE_PRICE_ID=

# Google Maps Configuration
VITE_GOOGLE_MAPS_API_KEY=
```

4. Firebase Setup
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select Storage when prompted
firebase deploy --only storage
```

5. Run Initial Setup
```bash
# Start the development server
npm run dev

# The app will automatically:
# - Run necessary migrations
# - Generate slugs for existing facilities
# - Update data structures as needed
# Check console for migration status
```

6. Build for Production
```bash
npm run build
```

## Project Structure
- `src/`: Frontend React application
  - `components/`: React components
  - `pages/`: Page components
  - `services/`: Service modules
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
- `server/`: Backend server logic
- `netlify/`: Serverless functions
- `prisma/`: Database schema
- `docs/`: Project documentation

[View Detailed Project Structure](./docs/README.md#code-organization)

## Contributing
Please read the [Contributing Guidelines](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.

## Need Help?
- Start with [Development Guidelines](./docs/README.md)
- Check [Components Documentation](./docs/COMPONENTS.md)
- Review [Technical Documentation](./docs/SERVICES.md)
- See [Troubleshooting Guide](./docs/README.md#troubleshooting)
