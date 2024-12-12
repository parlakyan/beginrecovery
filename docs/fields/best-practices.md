# Best Practices

This document outlines best practices for working with the Recovery Directory's field system.

## Code Organization

### 1. Type Definitions

```typescript
// ✓ DO: Use clear, descriptive interfaces
interface TreatmentType {
  id: string;
  name: string;
  description: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

// ✗ DON'T: Use generic or ambiguous types
interface Item {
  id: string;
  value: string;
  // ... ambiguous properties
}
```

### 2. File Structure

```
src/
├── components/
│   ├── TreatmentTypesSection.tsx   // Display component
│   ├── EditTreatmentTypeModal.tsx  // Edit form
│   └── ui/
│       └── FieldCard.tsx           // Reusable card
├── services/
│   └── treatmentTypes.ts           // Service layer
├── types/
│   └── index.ts                    // Type definitions
└── pages/
    └── admin/
        └── TreatmentTypesPage.tsx  // Admin page
```

### 3. Component Organization

```typescript
// ✓ DO: Organize components logically
function TreatmentTypesSection({ items, isVerified }) {
  // Props destructuring at top
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Handlers next
  const handleSelect = useCallback((item) => {
    setSelectedItem(item);
  }, []);
  
  // Render helpers
  const renderItem = useCallback((item) => (
    <FieldCard 
      key={item.id}
      item={item}
      isVerified={isVerified}
      onSelect={handleSelect}
    />
  ), [isVerified, handleSelect]);
  
  // Main render
  return (
    <section>
      {items.map(renderItem)}
    </section>
  );
}

// ✗ DON'T: Mix concerns or nest handlers
function MessyComponent({ data }) {
  const handleClick = (e) => {
    const doSomething = () => {
      // Nested handlers are hard to test
    };
    doSomething();
  };
}
```

## Type Safety

### 1. Type Guards

```typescript
// ✓ DO: Use type guards for runtime safety
function isTreatmentType(value: any): value is TreatmentType {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'description' in value
  );
}

// Usage
const items = data.filter(isTreatmentType);

// ✗ DON'T: Use type assertions without checks
const items = data as TreatmentType[];  // Unsafe
```

### 2. Null Handling

```typescript
// ✓ DO: Handle null/undefined explicitly
function FieldDisplay({ item }: { item?: Field }) {
  if (!item) return null;
  
  return (
    <div>
      <h3>{item.name}</h3>
      {item.description && (
        <p>{item.description}</p>
      )}
    </div>
  );
}

// ✗ DON'T: Assume values exist
function UnsafeDisplay({ item }) {
  return <div>{item.name}</div>;  // May crash
}
```

## Performance

### 1. Memoization

```typescript
// ✓ DO: Memoize expensive operations
const MemoizedFieldList = memo(function FieldList({ items }) {
  return (
    <div>
      {items.map(item => (
        <FieldCard 
          key={item.id}
          item={item}
        />
      ))}
    </div>
  );
});

// ✗ DON'T: Recreate functions in render
function BadExample({ items }) {
  return items.map(item => {
    const handleClick = () => {};  // Created every render
    return <div onClick={handleClick}>{item.name}</div>;
  });
}
```

### 2. Data Loading

```typescript
// ✓ DO: Implement proper loading states
function FieldSection() {
  const { data, loading, error } = useQuery(GET_FIELDS);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  if (!data?.fields?.length) return <EmptyState />;

  return <FieldList items={data.fields} />;
}

// ✗ DON'T: Ignore loading states
function BadExample() {
  const { data } = useQuery(GET_FIELDS);
  return <div>{data.fields.map(/*...*/)}</div>;  // May crash
}
```

## Error Handling

### 1. Service Layer

```typescript
// ✓ DO: Handle errors gracefully
export const fieldService = {
  async getFields(): Promise<Field[]> {
    try {
      const snapshot = await getDocs(query);
      return snapshot.docs.map(transformField);
    } catch (error) {
      console.error('Failed to fetch fields:', error);
      throw new Error('Failed to fetch fields');
    }
  }
};

// ✗ DON'T: Leave errors uncaught
async function unsafeGet() {
  const snapshot = await getDocs(query);  // Unhandled error
  return snapshot.docs.map(transformField);
}
```

### 2. Component Layer

```typescript
// ✓ DO: Show meaningful error states
function FieldManager() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = useCallback((error: Error) => {
    setError(error);
    // Log to monitoring service
    logError(error);
  }, []);

  if (error) {
    return (
      <ErrorBoundary>
        <ErrorMessage 
          error={error}
          onRetry={() => setError(null)}
        />
      </ErrorBoundary>
    );
  }

  return <FieldList onError={handleError} />;
}

// ✗ DON'T: Swallow errors
function UnsafeManager() {
  try {
    return <FieldList />;
  } catch (e) {
    return null;  // User doesn't know what happened
  }
}
```

## Testing

### 1. Component Tests

```typescript
// ✓ DO: Test component behavior
describe('FieldCard', () => {
  it('renders verified content when verified', () => {
    const { getByText, queryByText } = render(
      <FieldCard 
        item={mockField}
        isVerified={true}
      />
    );

    expect(getByText(mockField.name)).toBeInTheDocument();
    expect(getByText(mockField.description)).toBeInTheDocument();
  });

  it('hides verified content when unverified', () => {
    const { getByText, queryByText } = render(
      <FieldCard 
        item={mockField}
        isVerified={false}
      />
    );

    expect(getByText(mockField.name)).toBeInTheDocument();
    expect(queryByText(mockField.description)).not.toBeInTheDocument();
  });
});

// ✗ DON'T: Test implementation details
it('bad test', () => {
  const wrapper = shallow(<FieldCard />);
  expect(wrapper.state().internalValue).toBe(true);
});
```

### 2. Service Tests

```typescript
// ✓ DO: Test service behavior
describe('fieldService', () => {
  it('transforms field data correctly', async () => {
    const mockData = { /* ... */ };
    const result = await fieldService.getFields();
    
    expect(result[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String)
    });
  });

  it('handles errors gracefully', async () => {
    // Mock Firebase error
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    await expect(fieldService.getFields())
      .rejects
      .toThrow('Failed to fetch fields');
  });
});
```

## Documentation

### 1. Code Comments

```typescript
// ✓ DO: Write meaningful comments
/**
 * Transforms raw field data from Firestore into the application model.
 * Handles timestamp conversion and sets default values.
 *
 * @param doc - Firestore document snapshot
 * @returns Transformed field object
 */
function transformField(doc: QueryDocumentSnapshot): Field {
  // Implementation
}

// ✗ DON'T: Write obvious comments
// Gets fields
function getFields() {
  // Return fields
  return fields;
}
```

### 2. Type Documentation

```typescript
// ✓ DO: Document complex types
/**
 * Represents a treatment type offered by facilities.
 * Required for all facilities and used in search/filtering.
 */
interface TreatmentType {
  /** Unique identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Detailed description (shown for verified facilities) */
  description: string;
  
  /** Logo URL (shown for verified facilities) */
  logo: string;
  
  /** ISO timestamp of creation */
  createdAt: string;
  
  /** ISO timestamp of last update */
  updatedAt: string;
}
```

## Related Documentation

- [Overview](./overview.md)
- [Collections](./collections.md)
- [Implementation Guide](./implementation.md)
- [Search System](./search.md)
- [Security](./security.md)
