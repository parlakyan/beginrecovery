# Field Collections

This document details each managed field collection in the Recovery Directory system.

## Treatment Types

### Purpose
Core treatment programs offered by facilities. This is a required field that defines the primary types of treatment available.

### Structure
```typescript
interface TreatmentType {
  id: string;
  name: string;        // e.g., "Residential", "Outpatient"
  description: string; // Detailed explanation of the treatment type
  logo: string;        // Visual representation
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Required for all facilities
- Primary filter in search
- Displayed prominently in facility cards
- Used in facility type categorization

### Common Values
- Residential Treatment
- Outpatient Program
- Intensive Outpatient
- Partial Hospitalization
- Detoxification
- Aftercare Support

## Substances

### Purpose
Specific substances that a facility is equipped to treat. Helps users find specialized treatment programs.

### Structure
```typescript
interface Substance {
  id: string;
  name: string;        // e.g., "Alcohol", "Opioids"
  description: string; // Details about treatment approach
  logo: string;        // Visual identifier
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Optional field
- Searchable/filterable
- Used in detailed facility view
- Important for specialization display

### Common Values
- Alcohol
- Opioids
- Cocaine
- Methamphetamine
- Prescription Drugs
- Marijuana

## Conditions

### Purpose
Mental health conditions that the facility can treat. Important for dual diagnosis treatment.

### Structure
```typescript
interface Condition {
  id: string;
  name: string;        // e.g., "Depression", "Anxiety"
  description: string; // Treatment approach details
  logo: string;        // Visual representation
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Optional field
- Searchable/filterable
- Displayed in mental health section
- Used for dual diagnosis indication

### Common Values
- Depression
- Anxiety
- PTSD
- Bipolar Disorder
- Eating Disorders
- OCD

## Therapies

### Purpose
Therapeutic approaches and methodologies used in treatment. Shows treatment diversity and specialization.

### Structure
```typescript
interface Therapy {
  id: string;
  name: string;        // e.g., "CBT", "DBT"
  description: string; // Methodology explanation
  logo: string;        // Visual identifier
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Optional field
- Displayed in treatment approach section
- Used to show treatment diversity
- Searchable/filterable

### Common Values
- Cognitive Behavioral Therapy (CBT)
- Dialectical Behavior Therapy (DBT)
- Group Therapy
- Individual Counseling
- Family Therapy
- Art Therapy

## Amenities

### Purpose
Physical features and services available at the facility. Helps users understand the facility environment.

### Structure
```typescript
interface Amenity {
  id: string;
  name: string;        // e.g., "Private Rooms", "Pool"
  description: string; // Feature details
  logo: string;        // Visual representation
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Required for all facilities
- Displayed in facility cards
- Searchable/filterable
- Used in facility comparison

### Common Values
- Private Rooms
- Semi-Private Rooms
- Pool
- Gym
- Meditation Room
- Recreation Areas

## Languages

### Purpose
Languages supported at the facility. Critical for accessibility and communication.

### Structure
```typescript
interface Language {
  id: string;
  name: string;        // e.g., "English", "Spanish"
  description: string; // Support level details
  logo: string;        // Language/flag icon
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Required for all facilities
- Important accessibility information
- Searchable/filterable
- Used in facility cards

### Common Values
- English
- Spanish
- Mandarin
- French
- Arabic
- Vietnamese

## Insurance Providers

### Purpose
Insurance companies accepted by the facility. Critical for treatment accessibility.

### Structure
```typescript
interface Insurance {
  id: string;
  name: string;        // e.g., "Aetna", "Blue Cross"
  description: string; // Coverage details
  logo: string;        // Insurance company logo
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Optional field
- Important filter criterion
- Displayed in contact section
- Used in facility comparison

### Common Values
- Aetna
- Blue Cross Blue Shield
- Cigna
- UnitedHealthcare
- Medicare
- Medicaid

## Licenses & Certifications

### Purpose
Professional accreditations and certifications. Validates facility quality and compliance.

### Structure
```typescript
interface License {
  id: string;
  name: string;        // e.g., "Joint Commission", "CARF"
  description: string; // Accreditation details
  logo: string;        // Certification logo
  createdAt: string;
  updatedAt: string;
}
```

### Usage
- Optional field
- Verified facilities only
- Displayed in credentials section
- Quality indicator

### Common Values
- Joint Commission Accreditation
- CARF Accreditation
- State Licenses
- SAMHSA Certification
- NAATP Membership
- LegitScript Certification

## Collection Management

### Admin Interface
Each collection has its own management page in the admin dashboard:
- Add new entries
- Edit existing entries
- Upload logos
- Update descriptions
- Remove entries

### Security Rules
```javascript
match /databases/{database}/documents {
  match /{collection}/{document=**} {
    allow read: if true;
    allow write: if request.auth != null && 
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  }
}
```

### Storage Rules
```javascript
match /storage/{bucket}/files {
  match /{collection}/{fileName} {
    allow read: if true;
    allow write: if request.auth != null && 
      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
  }
}
```

## Related Documentation

- [Overview](./overview.md)
- [Implementation Guide](./implementation.md)
- [Search System](./search.md)
- [Security](./security.md)
