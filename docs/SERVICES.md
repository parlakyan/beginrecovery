# Services Architecture Documentation

## Overview
The Recovery Directory platform uses a modular service architecture to handle different aspects of the application. This document details the main services and their interactions.

## Services Structure

### Facilities Service
Located in `src/services/facilities/`, split into modular components:

#### Core Modules
- `types.ts`: Core facility types and interfaces
- `utils.ts`: Data transformation and utility functions
- `crud.ts`: Basic CRUD operations
- `search.ts`: Search and filtering operations
- `moderation.ts`: Moderation-related operations
- `verification.ts`: Verification status operations
- `index.ts`: Unified export of all facility services

#### Key Features
- Facility CRUD operations
- Search and filtering
- Moderation workflow
- Verification status management
- License and insurance integration
- Photo and logo management

```typescript
// Example usage
import { facilitiesService } from '../services/facilities';

// Create facility
const { id } = await facilitiesService.createFacility(data);

// Search facilities
const results = await facilitiesService.searchFacilities({
  query: searchText,
  treatmentTypes,
  amenities,
  insurance,
  rating
});
```

### Users Service
Located in `src/services/users.ts`, handles user management:

#### Key Features
- User CRUD operations
- Role management
- Authentication integration
- Password reset functionality
- User statistics

```typescript
// Example usage
import { usersService } from '../services/users';

// Create user
const user = await usersService.createUser({
  email,
  role,
  createdAt
});

// Get user statistics
const stats = await usersService.getUserStats();
```

### Licenses Service
Located in `src/services/licenses.ts`, manages facility certifications:

#### Key Features
- License CRUD operations
- Integration with facility verification
- Admin management interface
- Logo management

```typescript
// Example usage
import { licensesService } from '../services/licenses';

// Get all licenses
const licenses = await licensesService.getLicenses();

// Add new license
const license = await licensesService.addLicense({
  name,
  description,
  logo
});
```

### Insurance Service
Located in `src/services/insurances.ts`, manages insurance providers:

#### Key Features
- Insurance provider CRUD operations
- Integration with facility profiles
- Logo management
- Admin management interface

```typescript
// Example usage
import { insurancesService } from '../services/insurances';

// Get all insurance providers
const providers = await insurancesService.getInsurances();

// Add new provider
const provider = await insurancesService.addInsurance({
  name,
  description,
  logo
});
```

### Network Service
Located in `src/services/network.ts`, handles online/offline functionality:

#### Key Features
- Network state management
- Offline mode handling
- Firestore enablement/disablement

```typescript
// Example usage
import { networkService } from '../services/network';

// Handle offline mode
await networkService.goOffline();

// Restore online functionality
await networkService.goOnline();
```

## Service Interactions

### Facility Creation Flow
```mermaid
graph TD
    A[Create Facility] --> B[Upload Photos]
    A --> C[Upload Logo]
    A --> D[Select Licenses]
    A --> E[Select Insurance]
    B --> F[Storage Service]
    C --> F
    D --> G[Licenses Service]
    E --> H[Insurance Service]
```

### Verification Flow
```mermaid
graph TD
    A[Verify Facility] --> B[Enable Premium Features]
    B --> C[Show Licenses]
    B --> D[Show Insurance]
    B --> E[Show Contact Info]
    B --> F[Show Staff Section]
```

## Best Practices

### Service Design
1. Modularity
   - Separate concerns
   - Clear interfaces
   - Minimal dependencies

2. Error Handling
   - Consistent error types
   - Proper error propagation
   - User-friendly messages
   - Logging

3. Type Safety
   - TypeScript interfaces
   - Runtime validation
   - Proper type conversions

### Data Management
1. Firestore Integration
   - Proper timestamp handling
   - Batch operations
   - Transaction safety
   - Data validation

2. Storage
   - File organization
   - Cleanup procedures
   - Access control
   - URL management

## Testing

### Unit Tests
```typescript
describe('facilitiesService', () => {
  it('creates facility with licenses', async () => {
    // Test facility creation with licenses
  });

  it('handles verification status changes', async () => {
    // Test verification flow
  });
});

describe('licensesService', () => {
  it('manages licenses correctly', async () => {
    // Test license management
  });
});
```

### Integration Tests
```typescript
describe('Service Interactions', () => {
  it('handles facility verification flow', async () => {
    // Test complete verification flow
  });

  it('manages facility updates with licenses', async () => {
    // Test facility update flow
  });
});
```

## Future Improvements
1. Enhanced caching
2. Offline support
3. Real-time updates
4. Better search optimization
5. Enhanced validation
6. Automated cleanup
7. Performance monitoring
8. Enhanced security
9. Better error handling
10. Documentation updates
