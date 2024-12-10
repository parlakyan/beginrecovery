# Key Components Documentation

## Overview
The Recovery Directory platform uses a component-based architecture with several key components that handle different aspects of the application. This document details the main components and their interactions.

## Core Components

### Tabs
Reusable tab interface component for consistent tab navigation across the application.

#### Features
- Consistent tab styling
- Active tab indication
- Content switching
- Scroll handling
- Customizable appearance

#### Props
```typescript
interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}
```

#### Usage
```tsx
const tabs = [
  {
    id: 'tab1',
    label: 'First Tab',
    content: <FirstTabContent />
  },
  {
    id: 'tab2',
    label: 'Second Tab',
    content: <SecondTabContent />
  }
];

<Tabs
  tabs={tabs}
  activeTab={currentTab}
  onTabChange={handleTabChange}
/>
```

### FilterBar
Handles search filters for facilities.

#### Features
- Location filtering by city and state
- Treatment type filtering
- Amenities filtering
- Rating filtering
- Search within filters
- Clear selection functionality
- Filter counts display

#### Props
```typescript
interface FilterBarProps {
  filters: SearchFiltersState;
  filterOptions: {
    locations: Set<string>;
    treatmentTypes: Set<string>;
    amenities: Set<string>;
  };
  optionCounts: {
    locations: { [key: string]: number };
    treatmentTypes: { [key: string]: number };
    amenities: { [key: string]: number };
  };
  onFilterChange: (type: keyof SearchFiltersState, value: string, clearOthers?: boolean) => void;
}
```

#### Usage
```tsx
<FilterBar
  filters={filters}
  filterOptions={filterOptions}
  optionCounts={optionCounts}
  onFilterChange={handleFilterChange}
/>
```

### SearchResults
Main component for displaying and filtering facilities.

#### Features
- URL-based search
- Multiple filter types
- Location-based filtering
- Dynamic result updates
- Loading states
- Empty state handling
- Filter persistence

#### State Management
```typescript
interface SearchFiltersState {
  location: string[];
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
  rating: number | null;
  priceRange: number | null;
}
```

#### Usage
```tsx
// URL-based search
/search?location=Los%20Angeles%2C%20CA

// Filter-based search
<SearchResults />
```

### LogoUpload
Handles facility logo upload and management.

#### Features
- Drag and drop support
- Image preview
- File validation
- Upload progress
- Logo removal
- Storage cleanup

#### Props
```typescript
interface LogoUploadProps {
  facilityId: string;
  existingLogo?: string;
  onLogoChange: (logo: string | undefined) => void;
}
```

#### Usage
```tsx
<LogoUpload 
  facilityId={facility.id}
  existingLogo={facility.logo}
  onLogoChange={handleLogoChange}
/>
```

### RehabCard
Primary component for displaying facility information.

#### Features
- Responsive layout
- Verification badge
- Photo display
- Action buttons
- Status indicators

#### Props
```typescript
interface RehabCardProps {
  facility: Facility;
  onEdit?: (facility: Facility) => void;
}
```

#### Usage
```tsx
<RehabCard 
  facility={facility}
  onEdit={handleEdit}
/>
```

### ImageCarousel
Handles photo display with different behaviors based on verification status.

#### Features
- Slideshow for verified listings
- Single photo for unverified
- Touch navigation
- Responsive design
- Progress indicators

#### Props
```typescript
interface ImageCarouselProps {
  images: string[];
  showNavigation?: boolean;
  onImageClick?: () => void;
  paginationPosition?: 'bottom' | 'elevated';
  isVerified?: boolean;
}
```

#### Usage
```tsx
<ImageCarousel 
  images={facility.images}
  showNavigation={facility.images.length > 1}
  isVerified={facility.isVerified}
/>
```

### EditListingModal
Modal component for editing facility information.

#### Features
- Form validation
- Photo management
- Logo management
- Real-time updates
- Error handling
- Status preservation

#### Props
```typescript
interface EditListingModalProps {
  facility: Facility;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Facility>) => Promise<void>;
}
```

#### Usage
```tsx
<EditListingModal
  facility={editingFacility}
  isOpen={isModalOpen}
  onClose={handleClose}
  onSave={handleSave}
/>
```

### ContactBox
Displays facility contact information and actions.

#### Features
- Contact buttons
- Verification status
- Logo display
- Upgrade prompt
- Contact form
- Social links

#### Props
```typescript
interface ContactBoxProps {
  facility: Facility;
}
```

#### Usage
```tsx
<ContactBox facility={facility} />
```

## Component Interactions

### Search Flow
```mermaid
graph TD
    A[SearchResults] --> B[FilterBar]
    A --> C[RehabCard]
    B --> D[Location Filter]
    B --> E[Treatment Types]
    B --> F[Amenities]
    B --> G[Rating]
    D --> H[Search Service]
    E --> H
    F --> H
    G --> H
    H --> C
```

### Listing Flow
```mermaid
graph TD
    A[RehabCard] --> B[ImageCarousel]
    A --> C[ContactBox]
    A --> D[EditListingModal]
    D --> B
    D --> E[PhotoUpload]
    D --> F[LogoUpload]
```

### Edit Flow
```mermaid
graph TD
    A[EditListingModal] --> B[PhotoUpload]
    A --> C[LogoUpload]
    A --> D[Form Fields]
    B --> E[Storage Service]
    C --> E
    D --> F[Facilities Service]
```

### Tab Navigation Flow
```mermaid
graph TD
    A[Tabs] --> B[Tab Content]
    B --> C[Content Components]
    A --> D[URL Params]
    D --> E[Browser History]
```

## Component Guidelines

### State Management
- Use local state for UI
- Use Zustand for global state
- Handle async operations
- Manage loading states
- Clean up on unmount

### Error Handling
- Form validation
- API errors
- Upload errors
- Network issues
- User feedback
- Storage cleanup errors

### Accessibility
- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast

## Best Practices

### Component Design
1. Single Responsibility
   - Each component has a specific purpose
   - Clear interfaces
   - Minimal dependencies

2. Composition
   - Use component composition
   - Share common logic
   - Maintain flexibility

### Search and Filtering
1. URL Integration
   - Support URL-based search
   - Maintain filter state
   - Handle browser navigation

2. Filter Management
   - Clear filter options
   - Multiple filter types
   - Filter counts
   - Search within filters

3. Performance
   - Optimize filter updates
   - Debounce searches
   - Cache results
   - Handle loading states
   - Optimize renders
   - Lazy loading
   - Memoization
   - Code splitting
   - Clean up resources

### Props
1. Required vs Optional
   - Mark required props
   - Provide defaults
   - Use TypeScript

2. Validation
   - Type checking
   - Runtime validation
   - Error boundaries

### State
1. Local vs Global
   - Use local when possible
   - Share through context
   - Global for app state

2. Updates
   - Batch updates
   - Optimize renders
   - Handle side effects
   - Clean up on unmount

## Testing

### Unit Tests
```typescript
describe('Tabs', () => {
  it('renders tabs correctly', () => {
    render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={jest.fn()} />);
    expect(screen.getByText('First Tab')).toBeInTheDocument();
  });

  it('handles tab changes', () => {
    const handleChange = jest.fn();
    render(<Tabs tabs={mockTabs} activeTab="tab1" onTabChange={handleChange} />);
    fireEvent.click(screen.getByText('Second Tab'));
    expect(handleChange).toHaveBeenCalledWith('tab2');
  });
});

describe('LogoUpload', () => {
  it('handles logo upload successfully', async () => {
    render(<LogoUpload facilityId="123" />);
    // Test upload flow
  });

  it('handles logo removal correctly', async () => {
    render(<LogoUpload facilityId="123" existingLogo="logo.jpg" />);
    // Test removal flow
  });
});
```

### Search Component Tests
```typescript
describe('FilterBar', () => {
  it('handles location filtering', () => {
    render(<FilterBar {...mockProps} />);
    // Test location filter
  });

  it('clears filters correctly', () => {
    render(<FilterBar {...mockProps} />);
    // Test clear functionality
  });
});

describe('SearchResults', () => {
  it('handles URL-based search', () => {
    render(<SearchResults />);
    // Test URL parameters
  });

  it('updates results on filter change', () => {
    render(<SearchResults />);
    // Test filter updates
  });
});
```

### Integration Tests
```typescript
describe('EditListingModal', () => {
  it('saves changes and updates display', async () => {
    render(<EditListingModal facility={facility} />);
    // Test edit flow
  });

  it('handles logo changes correctly', async () => {
    render(<EditListingModal facility={facility} />);
    // Test logo update flow
  });
});
```

## Common Patterns

### Loading States
```tsx
{loading ? (
  <LoadingSpinner />
) : (
  <ComponentContent />
)}
```

### Error Handling
```tsx
{error ? (
  <ErrorMessage message={error} />
) : (
  <ComponentContent />
)}
```

### Conditional Rendering
```tsx
{facility.isVerified && (
  <VerifiedFeatures />
)}
```

### Resource Cleanup
```tsx
useEffect(() => {
  return () => {
    // Clean up resources
  };
}, []);
```

## Future Improvements
1. Component library
2. Storybook integration
3. Performance monitoring
4. Enhanced accessibility
5. Animation system
6. Theme customization
7. Enhanced error handling
8. Better loading states
9. More test coverage
10. Documentation updates
11. Enhanced search capabilities
12. Filter persistence
13. Search history
14. Related results
15. Filter analytics