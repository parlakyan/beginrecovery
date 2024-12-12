# Adding New Filters and Fields

This guide explains how to add new filterable fields to the Recovery Directory system. We'll use the example of how conditions and therapies were implemented to demonstrate the process.

## Overview

The system handles two types of fields:
1. Simple fields (strings, numbers) - e.g., amenities, languages
2. Complex fields (objects with multiple properties) - e.g., conditions, therapies, insurances

## Step-by-Step Guide

### 1. Define the Type

First, define the type in `src/types.ts`:

```typescript
// For complex fields, define an interface
export interface NewFieldType {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

// Update the Facility interface
export interface Facility {
  // ... existing fields ...
  newField?: NewFieldType[];  // Make it optional with ?
}

// Update the SearchFiltersState interface
export interface SearchFiltersState {
  // ... existing fields ...
  newField: string[];  // Array of IDs for filtering
}
```

### 2. Create the Service

Create a new service file in `src/services/newField.ts`:

```typescript
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { NewFieldType } from '../types';

const COLLECTION = 'newField';

export const newFieldService = {
  async getNewField(): Promise<NewFieldType[]> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const q = query(collectionRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as NewFieldType[];
    } catch (error) {
      console.error('Error getting new field items:', error);
      return [];
    }
  },

  async getNewFieldById(id: string): Promise<NewFieldType | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as NewFieldType;
    } catch (error) {
      console.error('Error getting new field item:', error);
      return null;
    }
  },

  async createNewField(data: Omit<NewFieldType, 'id' | 'createdAt' | 'updatedAt'>): Promise<NewFieldType | null> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return await this.getNewFieldById(docRef.id);
    } catch (error) {
      console.error('Error creating new field item:', error);
      return null;
    }
  },

  async updateNewField(id: string, data: Partial<NewFieldType>): Promise<NewFieldType | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return await this.getNewFieldById(id);
    } catch (error) {
      console.error('Error updating new field item:', error);
      return null;
    }
  },

  async deleteNewField(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting new field item:', error);
      return false;
    }
  }
};
```

### 3. Create Admin Page

Create a new admin page in `src/pages/admin/NewFieldPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { NewFieldType } from '../../types';
import { newFieldService } from '../../services/newField';
import { Button, AdminEntryCard } from '../../components/ui';
import EditModal from '../../components/EditModal';

export default function NewFieldPage() {
  const [items, setItems] = useState<NewFieldType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewFieldType | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await newFieldService.getNewField();
      setItems(data);
    } catch (err) {
      setError('Failed to fetch items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (data: Omit<NewFieldType, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newItem = await newFieldService.createNewField(data);
      if (newItem) {
        setItems(prev => [...prev, newItem]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating item:', err);
    }
  };

  const handleUpdate = async (id: string, data: Partial<NewFieldType>) => {
    try {
      const updatedItem = await newFieldService.updateNewField(id, data);
      if (updatedItem) {
        setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      }
      setEditingItem(null);
    } catch (err) {
      console.error('Error updating item:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const success = await newFieldService.deleteNewField(id);
      if (success) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage New Field</h1>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <AdminEntryCard
            key={item.id}
            title={item.name}
            description={item.description}
            logo={item.logo}
            onEdit={() => setEditingItem(item)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </div>

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        title="Add New Field Item"
      />

      {editingItem && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSubmit={(data) => handleUpdate(editingItem.id, data)}
          title="Edit Field Item"
          initialData={editingItem}
        />
      )}
    </div>
  );
}
```

### 4. Update Data Transformation

In `src/services/facilities/utils.ts`, update the transformFacilityData function:

```typescript
interface RawNewFieldType {
  id?: string;
  name?: string;
  description?: string;
  logo?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export const transformFacilityData = (doc: QueryDocumentSnapshot<DocumentData>): Facility => {
  const data = doc.data();
  
  // Transform the new field data
  const newField = (data.newField || []).map((item: RawNewFieldType) => {
    if (typeof item === 'object' && item !== null) {
      return {
        id: item.id || '',
        name: item.name || '',
        description: item.description || '',
        logo: item.logo || '',
        createdAt: item.createdAt instanceof Timestamp 
          ? item.createdAt.toDate().toISOString()
          : (item.createdAt || new Date().toISOString()),
        updatedAt: item.updatedAt instanceof Timestamp
          ? item.updatedAt.toDate().toISOString()
          : (item.updatedAt || new Date().toISOString())
      } as NewFieldType;
    }
    return null;
  }).filter(Boolean) as NewFieldType[];

  return {
    // ... existing fields ...
    newField,
  };
};
```

### 5. Create a Display Component

Create a new component in `src/components/NewFieldSection.tsx`:

```typescript
import React from 'react';
import { NewFieldType } from '../types';

interface NewFieldSectionProps {
  items: NewFieldType[];
}

export default function NewFieldSection({ items }: NewFieldSectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">New Field Title</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col items-center text-center">
            {item.logo && (
              <img
                src={item.logo}
                alt={item.name}
                className="w-16 h-16 object-contain mb-3"
              />
            )}
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            {item.description && (
              <p className="text-sm text-gray-600 mt-1">{item.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Update Form Components

In both `CreateListing.tsx` and `EditListingModal.tsx`:

```typescript
// Add to form interface
interface CreateListingForm {
  // ... existing fields ...
  newField: NewFieldType[];
}

// Add to form state
const [availableNewField, setAvailableNewField] = useState<NewFieldType[]>([]);

// Add to useEffect that fetches options
React.useEffect(() => {
  const fetchData = async () => {
    const [/* existing fetches */, newField] = await Promise.all([
      // ... existing fetches ...
      newFieldService.getNewField()
    ]);
    // ... existing setters ...
    setAvailableNewField(newField);
  };
  fetchData();
}, []);

// Add to form fields
<DropdownSelect
  label="New Field"
  type="newField"
  value={(selectedNewField || []).map(item => item.id)}
  onChange={(values) => {
    const selected = availableNewField.filter(item => values.includes(item.id));
    setValue('newField', selected);
  }}
  options={availableNewField.map(item => ({
    value: item.id,
    label: item.name
  }))}
  error={errors.newField?.message}
/>
```

### 7. Update FilterBar Component

The FilterBar component already handles new fields automatically as long as they're added to the SearchFiltersState interface and the filterOptions prop includes the new field's options.

### 8. Update ListingDetail Component

In `src/pages/ListingDetail.tsx`:

```typescript
{/* New Field Section */}
{facility.newField && facility.newField.length > 0 && (
  <NewFieldSection items={facility.newField} />
)}
```

### 9. Update RehabCard Component

In `src/components/RehabCard.tsx`, update the allTags array if the new field should appear in tags:

```typescript
const allTags = [
  // ... existing tags ...
  ...(facility.newField?.map(item => ({ text: item.name, type: 'newField' })) || [])
];
```

### 10. Update Admin Navigation and Routes

In `src/pages/AdminDashboard.tsx`, add the new page to the navigation:

```typescript
const adminRoutes = [
  // ... existing routes ...
  {
    path: '/admin/new-field',
    label: 'New Field',
    icon: Icon,  // Choose appropriate icon from lucide-react
    component: NewFieldPage
  }
];
```

Also update the route configuration in `src/App.tsx`:

```typescript
<Route path="/admin/new-field" element={<NewFieldPage />} />
```

## Common Issues and Solutions

1. **Field Not Appearing in Filters**
   - Check if the field is added to SearchFiltersState
   - Verify filterOptions includes the new field
   - Ensure the FilterBar component receives the options

2. **Data Not Saving Correctly**
   - Check the transformFacilityData function
   - Verify the service is handling timestamps correctly
   - Ensure proper type conversion in forms

3. **Display Issues**
   - Check null handling in components
   - Verify CSS classes are applied correctly
   - Test responsive behavior

4. **Type Errors**
   - Ensure all interfaces are properly defined
   - Check for optional fields with ?
   - Verify type imports are correct

5. **Admin Page Issues**
   - Check route configuration
   - Verify navigation setup
   - Test CRUD operations

## Best Practices

1. Always make new fields optional in the Facility interface
2. Use null checks when accessing optional fields
3. Provide default empty arrays in form defaultValues
4. Follow existing patterns for consistency:
   - Complex objects for data storage
   - String arrays (IDs) for filtering
   - Full objects for display
5. Maintain type safety throughout the application
6. Add proper error handling and loading states
7. Follow the existing component structure and styling

## Testing

When adding a new field:
1. Test creation of new facilities with the field
2. Test editing existing facilities
3. Test filtering and search functionality
4. Test display in both list and detail views
5. Test with missing or partial data
6. Test with various screen sizes

## Notes

- The system uses Firestore for data storage
- Complex fields are stored as arrays of objects
- Filtering uses arrays of IDs for efficiency
- The UI is built with Tailwind CSS
- Components follow a consistent pattern for maintainability
- Admin pages should be added to the admin dashboard navigation
- New services should follow the existing service pattern
- Always update types when adding new fields
- Consider backwards compatibility when making changes
- Document any special handling or edge cases
- Follow the existing error handling patterns
- Use proper TypeScript types throughout
- Keep components focused and reusable
- Follow the established naming conventions
- Use consistent styling patterns
- Add proper loading states
- Handle errors gracefully
- Consider mobile responsiveness
- Add proper validation
- Follow security best practices
- Document API endpoints
- Update tests as needed

## Example Implementation

For a complete example, see how conditions and therapies are implemented:
- Types in `src/types.ts`
- Service in `src/services/conditions.ts` and `src/services/therapies.ts`
- Components in `src/components/ConditionsSection.tsx` and `src/components/TherapiesSection.tsx`
- Admin pages in `src/pages/admin/ConditionsPage.tsx` and `src/pages/admin/TherapiesPage.tsx`
- Transformation in `src/services/facilities/utils.ts`

## Security Considerations

1. **Firestore Rules**
   ```javascript
   match /databases/{database}/documents {
     // Base rules for the new collection
     match /newField/{document=**} {
       // Allow read for all authenticated users
       allow read: if request.auth != null;
       
       // Allow write only for admins
       allow write: if request.auth != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
     }

     // Rules for facilities using the new field
     match /facilities/{facilityId} {
       allow update: if request.auth != null && 
         (request.auth.uid == resource.data.ownerId || 
          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin') &&
         // Validate newField references exist
         request.resource.data.newField.size() == 0 || 
         request.resource.data.newField.hasAll(get(/databases/$(database)/documents/newField/$(request.resource.data.newField)).data);
     }
   }
   ```

2. **Data Validation**
   - Validate data on the client side
   - Add server-side validation
   - Sanitize user input

3. **Access Control**
   - Restrict admin routes
   - Verify user permissions
   - Log sensitive operations

## Performance Considerations

1. **Data Loading**
   - Use pagination where appropriate
   - Implement lazy loading for large lists
   - Optimize Firestore queries

2. **Rendering**
   - Use proper key props
   - Implement virtualization for long lists
   - Optimize component re-renders

3. **Caching**
   - Cache frequently accessed data
   - Use memoization where appropriate
   - Consider implementing service workers

## Related Documentation

- [COMPONENTS.md](./COMPONENTS.md) - Component guidelines
- [SERVICES.md](./SERVICES.md) - Service layer documentation
- [STORAGE.md](./STORAGE.md) - File storage guidelines
- [VERIFICATION.md](./VERIFICATION.md) - Verification system
- [API.md](./API.md) - API documentation
