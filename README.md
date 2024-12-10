# Recovery Directory Project

## Project Overview
A comprehensive platform connecting individuals seeking rehabilitation services with treatment facilities. The platform offers both free (Unverified) and paid (Verified) listings, with different feature sets for each tier.

## Listing Features

### Verified (Paid) Listings
- Full photo gallery with slideshow (up to 12 photos)
- Green "Verified" badge
- "Currently accepting patients" status indicator
- Facility logo display and management
  - Custom logo upload
  - Logo appears in contact box
  - Logo management in edit modal
- Homepage showcase based on location
- Certifications section
- Staff section
- Call and Message buttons
- Website link
- Featured in search results

### Unverified (Free) Listings
- Single photo display
- Basic facility information
- Standard search listing
- Basic contact information
- Logo can be uploaded but won't display until verified

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

## User Roles & Permissions

### Admin
- Access to admin dashboard
- Can edit any facility
- Can approve/reject/archive listings
- Can toggle verification status
- Can feature/unfeature listings
- Can manage facility logos and photos

### Facility Owner
- Can create and edit own listings
- Can upgrade to verified status
- Can view listing status (pending/approved/rejected)
- Can manage facility photos and logo
- Access to owner dashboard

### Regular User
- Can browse facilities
- Can view facility details
- Can save favorite facilities
- Can contact facilities

## Design System
This project follows a strict design system defined in `docs/DESIGN_SYSTEM.md`. Please review the design system before contributing to ensure consistency in:
- Color palette
- Typography
- Spacing
- Component design
- Code conventions

## Prerequisites
- Node.js (v18 or later)
- npm or yarn
- Firebase account
- Stripe account
- Firebase CLI (for storage configuration)
- Google Maps API key (for location services)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd recovery-directory
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root with the following variables:

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

### 4. Firebase Setup
1. Create a new Firebase project
2. Enable Authentication, Firestore, Storage, and Analytics
3. Generate a web app configuration
4. Copy the configuration values into the `.env` file
5. Install Firebase CLI and initialize storage:
```bash
npm install -g firebase-tools
firebase login
firebase init
# Select Storage when prompted
firebase deploy --only storage
```
See `docs/STORAGE.md` for detailed storage configuration and `docs/PHOTO_UPLOAD.md` for photo/logo management.

### 5. Stripe Setup
1. Create a Stripe account
2. Set up a product and price for facility subscriptions
3. Get your public and secret keys
4. Configure webhook endpoints for subscription management

### 6. Google Maps Setup
1. Create a Google Cloud project
2. Enable Maps JavaScript API and Geocoding API
3. Create API credentials
4. Add the API key to your environment variables

### 7. Development
```bash
npm run dev
```

### 8. Build for Production
```bash
npm run build
```

## Project Structure
- `src/`: Frontend React application
  - `components/`: React components
    - `FeaturedCarousel/`: Location-based carousel component
    - `ImageCarousel/`: Image slideshow component
    - `RehabCard/`: Facility card component
    - `EditListingModal/`: Facility editing modal
    - `LogoUpload/`: Logo management component
  - `pages/`: Page components
  - `services/`: Service modules
    - `facilities/`: Modular facility services
      - `types.ts`: Core facility types
      - `utils.ts`: Data transformation utilities
      - `crud.ts`: CRUD operations
      - `search.ts`: Search functionality
      - `moderation.ts`: Moderation operations
      - `verification.ts`: Verification handling
      - `index.ts`: Service exports
    - `users.ts`: User management service
    - `licenses.ts`: License management service
    - `insurances.ts`: Insurance provider service
    - `network.ts`: Network state management
    - `storage.ts`: File storage service
  - `hooks/`: Custom React hooks
  - `types/`: TypeScript type definitions
  - `utils/`: Utility functions
- `server/`: Backend server logic
- `netlify/`: Serverless functions
- `prisma/`: Database schema
- `docs/`: Project documentation
  - `COMPONENTS.md`: Component documentation
  - `SERVICES.md`: Services architecture documentation
  - `VERIFICATION.md`: Verification system
  - `STORAGE.md`: Storage system
  - `DESIGN_SYSTEM.md`: Design guidelines

## Services Architecture
The project uses a modular service architecture detailed in `docs/SERVICES.md`. Key features:

### Facilities Service
- Modular structure for better organization
- Separate concerns (CRUD, search, moderation)
- Integration with licenses and insurance
- Verification status management

### Users Service
- User management and authentication
- Role-based access control
- Profile management
- Statistics tracking

### Licenses Service
- License/certification management
- Integration with facility verification
- Logo management
- Admin controls

### Insurance Service
- Insurance provider management
- Integration with facility profiles
- Logo management
- Admin controls

### Network Service
- Online/offline state management
- Connection handling
- Firestore network control

[Rest of the README content remains the same...]

## Key Features

### Facility Directory
- Advanced search and filtering
- Location-based results
- Treatment type categorization
- Amenity filtering

### Listing Management
- Different display rules for verified/unverified listings
- Moderation system (pending/approved/rejected/archived)
- Owner dashboard for listing management
- Admin dashboard for content moderation

### Photo & Logo System
- Up to 12 photos per facility
- One logo per facility
- Slideshow for verified listings
- Single photo for unverified listings
- Logo display for verified listings
- Drag and drop support
- Progress tracking
- Storage cleanup on removal

### Location Services
- User location detection
- Location-based facility sorting
- Geocoding integration
- Location-aware messaging

### Payment Integration
- Stripe subscription management
- Automatic verification status updates
- Payment webhook handling
- Subscription status tracking

## Design System Compliance
All contributions MUST adhere to the design system guidelines in `docs/DESIGN_SYSTEM.md`. This includes:
- Color usage
- Typography
- Component design
- Code conventions
- Accessibility standards

## Firebase Storage
The project uses Firebase Storage for handling facility photos and logos. Key points:
- Organized storage structure
- Separate directories for photos and logos
- Public read access, authenticated write access
- File size and type restrictions
- Automatic cleanup on removal
- Detailed documentation in `docs/STORAGE.md`

## Contributing
Please read the CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.
