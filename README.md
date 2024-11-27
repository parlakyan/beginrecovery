# Recovery Directory Project

## Project Overview
A comprehensive platform connecting individuals seeking rehabilitation services with treatment facilities.

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
# Firebase Configuration (from Firebase Console)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Stripe Configuration (from Stripe Dashboard)
VITE_STRIPE_PUBLIC_KEY=
VITE_STRIPE_PRICE_ID=
```

### 4. Firebase Setup
1. Create a new Firebase project
2. Enable Authentication, Firestore, and Analytics
3. Generate a web app configuration
4. Copy the configuration values into the `.env` file

### 5. Stripe Setup
1. Create a Stripe account
2. Set up a product and price for facility subscriptions
3. Get your public and secret keys
4. Configure webhook endpoints

### 6. Development
```bash
npm run dev
```

### 7. Build for Production
```bash
npm run build
```

## Project Structure
- `src/`: Frontend React application
- `server/`: Backend server logic
- `netlify/`: Serverless functions
- `prisma/`: Database schema
- `docs/`: Project documentation, including design system

## Key Features
- Facility directory
- User authentication
- Subscription management
- Search and filtering

## Design System Compliance
All contributions MUST adhere to the design system guidelines in `docs/DESIGN_SYSTEM.md`. This includes:
- Color usage
- Typography
- Component design
- Code conventions
- Accessibility standards

## Contributing
Please read the CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License.
