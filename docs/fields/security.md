# Security Documentation

This document details the security implementation for the Recovery Directory's field system.

## Overview

The security system ensures:
- Proper access control
- Data validation
- Asset protection
- Role-based permissions
- Safe file uploads

## Firestore Security Rules

### Base Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isOwner(facilityId) {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/facilities/$(facilityId)).data.ownerId == request.auth.uid;
    }

    // Common validation functions
    function isValidString(value) {
      return value is string && value.size() > 0 && value.size() <= 500;
    }

    function isValidTimestamp(value) {
      return value is timestamp;
    }

    function isValidUrl(value) {
      return value is string && 
        value.matches('^https?://.*') && 
        value.size() <= 2048;
    }
  }
}
```

### Field Collection Rules

```javascript
match /databases/{database}/documents {
  // Rules for managed field collections
  match /{collection}/{document} {
    allow read: if true;  // All field collections are publicly readable
    
    allow write: if isAdmin() &&
      request.resource.data.keys().hasAll(['name', 'description', 'createdAt', 'updatedAt']) &&
      isValidString(request.resource.data.name) &&
      isValidString(request.resource.data.description) &&
      (!request.resource.data.logo || isValidUrl(request.resource.data.logo)) &&
      isValidTimestamp(request.resource.data.createdAt) &&
      isValidTimestamp(request.resource.data.updatedAt);
  }

  // Specific rules for each collection
  match /treatmentTypes/{document} {
    allow write: if isAdmin();
  }

  match /amenities/{document} {
    allow write: if isAdmin();
  }

  match /languages/{document} {
    allow write: if isAdmin();
  }

  match /substances/{document} {
    allow write: if isAdmin();
  }

  match /conditions/{document} {
    allow write: if isAdmin();
  }

  match /therapies/{document} {
    allow write: if isAdmin();
  }

  match /insurances/{document} {
    allow write: if isAdmin();
  }

  match /licenses/{document} {
    allow write: if isAdmin();
  }
}
```

### Facility Rules

```javascript
match /facilities/{facilityId} {
  // Read rules
  allow read: if true;  // Public read access

  // Create rules
  allow create: if isAuthenticated() &&
    request.resource.data.ownerId == request.auth.uid &&
    validateFacilityFields(request.resource.data);

  // Update rules
  allow update: if (isOwner(facilityId) || isAdmin()) &&
    validateFacilityFields(request.resource.data);

  // Delete rules
  allow delete: if isAdmin();

  // Field validation function
  function validateFacilityFields(data) {
    return data.keys().hasAll([
      'name', 'description', 'location', 'amenityObjects', 
      'languageObjects', 'treatmentTypes'
    ]) &&
    isValidString(data.name) &&
    isValidString(data.description) &&
    isValidString(data.location) &&
    validateFieldArray(data.amenityObjects) &&
    validateFieldArray(data.languageObjects) &&
    validateFieldArray(data.treatmentTypes) &&
    (!data.logo || isValidUrl(data.logo));
  }

  // Array validation helper
  function validateFieldArray(array) {
    return array is list &&
      array.size() <= 50 &&  // Reasonable limit
      array.every(item => 
        item is map &&
        item.keys().hasAll(['id', 'name']) &&
        isValidString(item.id) &&
        isValidString(item.name)
      );
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isAdmin() {
      return isAuthenticated() &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    function isValidImage() {
      return request.resource.contentType.matches('image/.*') &&
        request.resource.size < 5 * 1024 * 1024;  // 5MB limit
    }

    // Rules for field logos
    match /fieldLogos/{collection}/{fileName} {
      allow read: if true;
      allow write: if isAdmin() && isValidImage();
    }

    // Specific collection rules
    match /treatmentTypes/{fileName} {
      allow read: if true;
      allow write: if isAdmin() && isValidImage();
    }

    match /amenities/{fileName} {
      allow read: if true;
      allow write: if isAdmin() && isValidImage();
    }

    match /languages/{fileName} {
      allow read: if true;
      allow write: if isAdmin() && isValidImage();
    }

    // ... similar rules for other collections
  }
}
```

## Access Control Matrix

| Operation               | Public | Authenticated | Owner | Admin |
|------------------------|---------|---------------|-------|-------|
| Read Field Collections | ✓       | ✓            | ✓     | ✓     |
| Create Field Entry     | ✗       | ✗            | ✗     | ✓     |
| Update Field Entry     | ✗       | ✗            | ✗     | ✓     |
| Delete Field Entry     | ✗       | ✗            | ✗     | ✓     |
| Upload Field Logo      | ✗       | ✗            | ✗     | ✓     |
| Read Facility Fields   | ✓       | ✓            | ✓     | ✓     |
| Update Facility Fields | ✗       | ✗            | ✓     | ✓     |

## Data Validation

### Field Entry Validation

```typescript
interface ValidationRules {
  name: {
    required: true,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-]+$/
  },
  description: {
    required: true,
    maxLength: 500
  },
  logo: {
    required: false,
    validate: (url: string) => url.startsWith('https://')
  }
}

function validateFieldEntry(data: any): boolean {
  // Implementation of validation logic
  return true;
}
```

### File Upload Validation

```typescript
const VALID_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function validateFileUpload(file: File): boolean {
  if (!VALID_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large');
  }

  return true;
}
```

## Best Practices

1. **Data Access**
   - Always use the most restrictive access level possible
   - Validate all input data
   - Use proper error handling

2. **File Security**
   - Validate file types before upload
   - Enforce size limits
   - Use secure URLs

3. **Role Management**
   - Keep roles simple and clear
   - Regularly audit admin access
   - Document role changes

4. **Error Handling**
   - Provide clear error messages
   - Log security events
   - Handle errors gracefully

## Related Documentation

- [Overview](./overview.md)
- [Collections](./collections.md)
- [Implementation Guide](./implementation.md)
- [Search System](./search.md)
