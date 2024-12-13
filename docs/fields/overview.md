# Field System Overview

## System Architecture

The Recovery Directory uses a managed field system that provides:
- Consistent data structure
- Rich functionality
- Admin control
- Type safety
- Search capabilities

### Core Components

1. **Data Layer**
   - Firestore collections for each field type
   - Managed objects with consistent structure
   - Relationships between facilities and fields

2. **Service Layer**
   - CRUD operations for each field type
   - Data transformation
   - Search functionality
   - Field management

3. **UI Layer**
   - Admin management interfaces
   - Display components
   - Search and filter components
   - Form integration

## Field Types

### 1. Base Field Structure

All fields follow this managed structure:
```typescript
interface ManagedField {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}
```

### 2. Field Categories

#### Core Treatment Fields
- **Treatment Types**
  - Core treatment programs
  - Required for all facilities
  - Examples: Residential, Outpatient

- **Substances**
  - Substances treated
  - Optional field
  - Examples: Alcohol, Opioids

- **Conditions**
  - Mental health conditions
  - Optional field
  - Examples: Depression, Anxiety

- **Therapies**
  - Treatment approaches
  - Optional field
  - Examples: CBT, DBT

#### Facility Features
- **Amenities**
  - Physical features and services
  - Required for all facilities
  - Examples: Private Rooms, Pool

- **Languages**
  - Supported languages
  - Required for all facilities
  - Examples: English, Spanish

#### Administrative Fields
- **Insurance Providers**
  - Accepted insurance
  - Optional field
  - Examples: Aetna, Blue Cross

- **Licenses & Certifications**
  - Professional accreditations
  - Optional field
  - Examples: Joint Commission, CARF

## Verification System

The system supports two facility types with different feature sets:

### 1. Unverified (Free) Facilities

#### Display Features
- Basic field information
- Limited section access

#### Available Sections
- Basic Information
- Treatment Types
- Amenities
- Languages
- Location

#### Limitations
- No staff section
- No certifications section
- No contact buttons
- No website link
- No messaging
- No featured placement

### 2. Verified (Paid) Facilities

#### Display Features
- Full field information
- Complete section access

#### Additional Features
- Staff section
- Certifications section
- Contact buttons
- Website link
- Message functionality
- Featured placement

#### Enhanced Display
- Rich field descriptions
- Logo display
- Expanded amenity details
- Full language support details

### Verification Status Management

1. **Status Tracking**
   ```typescript
   interface Facility {
     isVerified: boolean;
     subscriptionId?: string;
     // ... other fields
   }
   ```

2. **Feature Access**
   ```typescript
   // Example component logic
   function FeatureSection({ facility }) {
     if (!facility.isVerified) {
       return null;
     }
     // Render verified-only content
   }
   ```

3. **Display Logic**
   ```typescript
   function FieldDisplay({ item, isVerified }) {
     return (
       <div>
         <h3>{item.name}</h3>
         {isVerified && (
           <>
             {item.logo && <img src={item.logo} alt={item.name} />}
             {item.description && <p>{item.description}</p>}
           </>
         )}
       </div>
     );
   }
   ```

## Integration Points

1. **Search System**
   - Fields are searchable by name
   - Verified status affects sorting
   - Field filters available

2. **Admin Dashboard**
   - Field management
   - Verification status control
   - Subscription management

3. **Facility Forms**
   - Field selection with managed fields
   - Verification-based features
   - Data validation

4. **Display Components**
   - Verification-aware rendering
   - Responsive layouts
   - Feature toggling

## Related Documentation

- [Field Collections](./collections.md)
- [Implementation Guide](./implementation.md)
- [Search System](./search.md)
- [Verification System](../VERIFICATION.md)
