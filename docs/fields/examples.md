# Implementation Examples

This document provides complete, real-world examples of field implementations in the Recovery Directory system.

## Treatment Types Implementation

A complete example of how treatment types are implemented:

### 1. Type Definition

```typescript
// src/types.ts
export interface TreatmentType {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Facility {
  // ... other fields
  treatmentTypes: TreatmentType[];
}
```

### 2. Service Implementation

```typescript
// src/services/treatmentTypes.ts
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
import { TreatmentType } from '../types';

const COLLECTION = 'treatmentTypes';

export const treatmentTypesService = {
  async getTreatmentTypes(): Promise<TreatmentType[]> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const q = query(collectionRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })) as TreatmentType[];
    } catch (error) {
      console.error('Error getting treatment types:', error);
      return [];
    }
  },

  async getTreatmentTypeById(id: string): Promise<TreatmentType | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) return null;
      
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: docSnap.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
      } as TreatmentType;
    } catch (error) {
      console.error('Error getting treatment type:', error);
      return null;
    }
  },

  async createTreatmentType(data: Omit<TreatmentType, 'id' | 'createdAt' | 'updatedAt'>): Promise<TreatmentType | null> {
    try {
      const collectionRef = collection(db, COLLECTION);
      const docRef = await addDoc(collectionRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      return await this.getTreatmentTypeById(docRef.id);
    } catch (error) {
      console.error('Error creating treatment type:', error);
      return null;
    }
  },

  async updateTreatmentType(id: string, data: Partial<TreatmentType>): Promise<TreatmentType | null> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      
      return await this.getTreatmentTypeById(id);
    } catch (error) {
      console.error('Error updating treatment type:', error);
      return null;
    }
  },

  async deleteTreatmentType(id: string): Promise<boolean> {
    try {
      const docRef = doc(db, COLLECTION, id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting treatment type:', error);
      return false;
    }
  }
};
```

### 3. Display Component

```typescript
// src/components/TreatmentTypesSection.tsx
import React from 'react';
import { TreatmentType } from '../types';

interface TreatmentTypesSectionProps {
  items: TreatmentType[];
  isVerified?: boolean;
}

export default function TreatmentTypesSection({ 
  items, 
  isVerified = false 
}: TreatmentTypesSectionProps) {
  if (!items?.length) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Treatment Programs</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div 
            key={item.id} 
            className="flex flex-col items-center text-center"
          >
            {isVerified && item.logo && (
              <img
                src={item.logo}
                alt={item.name}
                className="w-16 h-16 object-contain mb-3"
              />
            )}
            <h3 className="font-medium text-gray-900">{item.name}</h3>
            {isVerified && item.description && (
              <p className="text-sm text-gray-600 mt-1">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Admin Page

```typescript
// src/pages/admin/TreatmentTypesPage.tsx
import React from 'react';
import { Plus } from 'lucide-react';
import { AdminEntryCard, Button } from '../../components/ui';
import { useAdminList } from '../../hooks/useAdminList';
import { treatmentTypesService } from '../../services/treatmentTypes';
import { TreatmentType } from '../../types';

export default function TreatmentTypesPage() {
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
  } = useAdminList<TreatmentType>({
    service: treatmentTypesService,
    itemName: 'treatment type'
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Treatment Types</h1>
        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Treatment Type
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

      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreate}
        title="Add Treatment Type"
      />

      {editingItem && (
        <EditModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          onSubmit={(data) => handleUpdate(editingItem.id, data)}
          title="Edit Treatment Type"
          initialData={editingItem}
        />
      )}
    </div>
  );
}
```

### 5. Search Integration

```typescript
// src/services/facilities/search.ts
function matchesTreatmentTypes(
  facility: Facility, 
  treatmentTypeIds: string[]
): boolean {
  if (!treatmentTypeIds?.length) return true;
  
  return treatmentTypeIds.some(id => 
    facility.treatmentTypes?.some(t => t.id === id)
  );
}

// In search function
facilities = facilities.filter(facility => {
  // ... other filters
  const matchesTreatment = matchesTreatmentTypes(
    facility, 
    params.treatmentTypes
  );
  return matchesQuery && matchesTreatment;
});
```

### 6. Filter Component

```typescript
// src/components/FilterBar.tsx
function TreatmentTypeFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [treatmentTypes, setTreatmentTypes] = useState<TreatmentType[]>([]);

  useEffect(() => {
    const loadTreatmentTypes = async () => {
      const items = await treatmentTypesService.getTreatmentTypes();
      setTreatmentTypes(items);
    };
    loadTreatmentTypes();
  }, []);

  const handleChange = (values: string[]) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('treatmentTypes');
    values.forEach(value => 
      newParams.append('treatmentTypes', value)
    );
    setSearchParams(newParams);
  };

  return (
    <DropdownSelect
      label="Treatment Types"
      value={searchParams.getAll('treatmentTypes')}
      onChange={handleChange}
      options={treatmentTypes.map(type => ({
        value: type.id,
        label: type.name
      }))}
    />
  );
}
```

### 7. Security Rules

```javascript
// firestore.rules
match /treatmentTypes/{document=**} {
  allow read: if true;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}

// storage.rules
match /treatmentTypes/{fileName} {
  allow read: if true;
  allow write: if request.auth != null && 
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin' &&
    request.resource.contentType.matches('image/.*') &&
    request.resource.size < 5 * 1024 * 1024;
}
```

## Related Documentation

- [Overview](./overview.md)
- [Collections](./collections.md)
- [Implementation Guide](./implementation.md)
- [Search System](./search.md)
- [Security](./security.md)
- [Best Practices](./best-practices.md)
