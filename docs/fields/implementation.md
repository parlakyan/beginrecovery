# Implementation Guide

This guide provides step-by-step instructions for adding new managed fields to the Recovery Directory system.

## Prerequisites

Before implementing a new field:
1. Review existing field collections in [Collections](./collections.md)
2. Understand the [Overview](./overview.md) architecture
3. Familiarize yourself with the [Search System](./search.md)

## Implementation Steps

### 1. Define Types

In `src/types.ts`:

```typescript
// Field type definition - follows managed field structure
export interface NewFieldType {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

// Update Facility interface
export interface Facility {
  // ... existing fields ...
  newFieldObjects: NewFieldType[];  // Use Objects suffix for managed fields
}

// Update search parameters
export interface SearchParams {
  // ... existing params ...
  newField: string[];  // Array of IDs for filtering
}
```

### 2. Create Service

Create `src/services/newField.ts`:

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

### 3. Create Display Component

Create `src/components/NewFieldSection.tsx`:

```typescript
import React from 'react';
import { NewFieldType } from '../types';
import { Tag } from './ui';

interface NewFieldSectionProps {
  items: NewFieldType[];
  isVerified?: boolean;
}

export default function NewFieldSection({ items, isVerified }: NewFieldSectionProps) {
  if (!items?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">New Field Title</h2>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Tag key={item.id} variant="primary">
            {item.name}
          </Tag>
        ))}
      </div>
    </div>
  );
}
```

### 4. Create Admin Page

Create `src/pages/admin/NewFieldPage.tsx`:

```typescript
import React from 'react';
import { Plus } from 'lucide-react';
import { AdminEntryCard, Button } from '../../components/ui';
import { useAdminList } from '../../hooks/useAdminList';
import { newFieldService } from '../../services/newField';
import { NewFieldType } from '../../types';

export default function NewFieldPage() {
  const {
    items,
    loading,
    error,
    isModalOpen,
    editingItem,
    handleCreate,
    handleUpdate,
    handleDelete,
    setIsModalOpen,
    setEditingItem
  } = useAdminList<NewFieldType>({
    service: newFieldService,
    itemName: 'new field'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

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

      {/* Add/Edit Modal components here */}
    </div>
  );
}
```

### 5. Update Search Integration

In `src/services/facilities/search.ts`:

```typescript
// Add to searchable fields
const searchableFields = [
  // ... existing fields ...
  ...(facility.newFieldObjects?.map(f => f.name) || [])
];

// Add field filter
const matchesNewField = newField.length === 0 ||
  newField.some(fieldId => 
    facility.newFieldObjects?.some(f => f.id === fieldId)
  );

// Include in filter results
return matchesQuery && 
       matchesLocation && 
       matchesTreatment && 
       matchesNewField;  // Add this line
```

### 6. Update Filter Bar

In `src/components/FilterBar.tsx`:

```typescript
<DropdownSelect
  label="New Field"
  type="newField"
  value={(newFieldObjects || []).map(f => f.id)}
  onChange={(values) => {
    const selected = availableNewField.filter(f => values.includes(f.id));
    setValue('newFieldObjects', selected);
  }}
  options={availableNewField.map(field => ({
    value: field.id,
    label: field.name
  }))}
  error={errors.newFieldObjects?.message}
/>
```

### 7. Add to Facility Forms

Update both `CreateListing.tsx` and `EditListingModal.tsx`:

```typescript
// Add to form state
const [availableNewField, setAvailableNewField] = useState<NewFieldType[]>([]);

// Add to useEffect
useEffect(() => {
  const fetchData = async () => {
    const [/* existing */,newField] = await Promise.all([
      // existing promises
      newFieldService.getNewField()
    ]);
    setAvailableNewField(newField);
  };
  fetchData();
}, []);

// Add form field
<DropdownSelect
  label="New Field"
  type="newField"
  value={(newFieldObjects || []).map(f => f.id)}
  onChange={(values) => {
    const selected = availableNewField.filter(f => values.includes(f.id));
    setValue('newFieldObjects', selected);
  }}
  options={availableNewField.map(field => ({
    value: field.id,
    label: field.name
  }))}
  error={errors.newFieldObjects?.message}
/>
```

### 8. Update Security Rules

In `storage.rules`:

```javascript
match /newField/{fileName} {
  allow read: if true;
  allow write: if isAdmin() && isValidImage();
}
```

In `firestore.rules`:

```javascript
match /newField/{document=**} {
  allow read: if true;
  allow write: if isAdmin();
}
```

### 9. Add to Navigation

In `src/pages/AdminDashboard.tsx`:

```typescript
const adminRoutes = [
  // ... existing routes ...
  {
    path: '/admin/new-field',
    label: 'New Field',
    icon: Icon,  // Choose appropriate icon
    component: NewFieldPage
  }
];
```

### 10. Update Route Configuration

In `src/App.tsx`:

```typescript
<Route 
  path="/admin/new-field" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <NewFieldPage />
    </ProtectedRoute>
  } 
/>
```

## Testing Checklist

1. [ ] Type definitions follow managed field structure
2. [ ] Service CRUD operations work
3. [ ] Admin page functions correctly
4. [ ] Display component uses Tag component
5. [ ] Search integration works
6. [ ] Filters use managed field structure
7. [ ] Form integration uses managed fields
8. [ ] Security rules are effective
9. [ ] Navigation works
10. [ ] Routes are protected

## Common Issues

1. **Type Errors**
   - Ensure field follows managed structure
   - Check for proper Objects suffix
   - Verify type imports

2. **Search Issues**
   - Verify field uses managed structure
   - Check filter implementation
   - Test sort functionality

3. **Display Problems**
   - Use Tag component for consistency
   - Check null handling
   - Test responsive behavior

4. **Security Issues**
   - Test security rules
   - Verify admin access
   - Check file upload restrictions

## Related Documentation

- [Overview](./overview.md)
- [Collections](./collections.md)
- [Search System](./search.md)
- [Security](./security.md)
