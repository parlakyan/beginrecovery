# Components Documentation

## Overview
The Recovery Directory platform uses a component-based architecture with several key components that handle different aspects of the application. This document provides an overview of the component organization and common patterns.

## Component Categories

### [UI Components](./ui.md)
Core UI building blocks like:
- Button
- Tag
- DropdownSelect
- MultiSelect
- Tabs
- Breadcrumb
- ImageCarousel

### [Upload Components](./upload.md)
Components for handling file uploads:
- AdminLogoUpload
- LogoUpload
- PhotoUpload

### [Feature Components](./feature.md)
Business logic components:
- ConditionsSection
- TherapiesSection
- InsurancesSection

### [Search Components](./search.md)
Search and filtering functionality:
- FilterBar
- SearchResults
- RehabCard

### [Modal Components](./modal.md)
Modal dialogs and overlays:
- EditListingModal
- ContactBox

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
