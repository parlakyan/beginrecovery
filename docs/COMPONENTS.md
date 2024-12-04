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

3. Performance
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
