# UI Components

Core UI building blocks used throughout the application.

## Table of Contents
- [Button](#button)
- [Tag](#tag)
- [DropdownSelect](#dropdownselect)
- [MultiSelect](#multiselect)
- [Tabs](#tabs)
- [Breadcrumb](#breadcrumb)
- [ImageCarousel](#imagecarousel)
- [AdminEntryCard](#adminentrycard)

## Button
Base button component with consistent styling and variants.

### Features
- Multiple variants (primary, secondary, outline)
- Loading state
- Disabled state
- Icon support
- Size variants

### Props
```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}
```

### Usage
```tsx
<Button 
  variant="primary"
  size="md"
  onClick={handleClick}
  loading={isLoading}
>
  Submit
</Button>
```

[Back to Top](#table-of-contents)

## Tag
Display tags with consistent styling.

### Features
- Multiple variants
- Color customization
- Icon support
- Clickable option

### Props
```typescript
interface TagProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}
```

### Usage
```tsx
<Tag variant="primary">Featured</Tag>
```

[Back to Top](#table-of-contents)

## DropdownSelect
Single-select dropdown component.

### Features
- Search functionality
- Custom rendering
- Loading state
- Error state
- Clear selection

### Props
```typescript
interface DropdownSelectProps<T> {
  options: T[];
  value: T | null;
  onChange: (value: T | null) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
  placeholder?: string;
  error?: string;
  loading?: boolean;
}
```

### Usage
```tsx
<DropdownSelect
  options={states}
  value={selectedState}
  onChange={setSelectedState}
  getLabel={(state) => state.name}
  getValue={(state) => state.code}
  placeholder="Select a state"
/>
```

[Back to Top](#table-of-contents)

## MultiSelect
Multiple-select dropdown component.

### Features
- Multiple selection
- Search functionality
- Custom rendering
- Loading state
- Error state
- Clear selection

### Props
```typescript
interface MultiSelectProps<T> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getLabel: (option: T) => string;
  getValue: (option: T) => string;
  placeholder?: string;
  error?: string;
  loading?: boolean;
}
```

### Usage
```tsx
<MultiSelect
  options={conditions}
  value={selectedConditions}
  onChange={setSelectedConditions}
  getLabel={(condition) => condition.name}
  getValue={(condition) => condition.id}
  placeholder="Select conditions"
/>
```

[Back to Top](#table-of-contents)

## Tabs
Handles tab-based navigation and content switching.

### Features
- Consistent tab styling
- Active tab indication
- Content switching
- URL integration
- Browser history support

### Props
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

### Usage
```tsx
<Tabs
  tabs={[
    { id: 'info', label: 'Information', content: <InfoContent /> },
    { id: 'reviews', label: 'Reviews', content: <ReviewsContent /> }
  ]}
  activeTab={currentTab}
  onTabChange={handleTabChange}
/>
```

[Back to Top](#table-of-contents)

## Breadcrumb

Navigation breadcrumb component.

### Features
- Dynamic path segments
- Custom separators
- Link integration
- Active item styling

### Props
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

interface BreadcrumbItem {
  label: string;
  href: string;
}
```

### Usage
```tsx
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    { label: 'Facility Name', href: '' }
  ]}
/>
```

[Back to Top](#table-of-contents)

## ImageCarousel
Handles photo display with different behaviors based on verification status.

### Features
- Slideshow for verified listings
- Single photo for unverified
- Touch navigation
- Responsive design
- Progress indicators

### Props
```typescript
interface ImageCarouselProps {
  images: string[];
  showNavigation?: boolean;
  onImageClick?: () => void;
  paginationPosition?: 'bottom' | 'elevated';
  isVerified?: boolean;
}
```

### Usage
```tsx
<ImageCarousel 
  images={facility.images}
  showNavigation={facility.images.length > 1}
  isVerified={facility.isVerified}
/>
```

[Back to Top](#table-of-contents)
## AdminEntryCard
Consistent card component for displaying entries in admin sections (Conditions, Substances, Therapies, Treatment Types).

### Features
- Large photo display (aspect-[3/2])
- Edit and delete actions
- Logo/image display with fallback
- Consistent styling across admin sections
- Hover effects and transitions

### Props
```typescript
interface AdminEntryCardProps {
  id: string;
  name: string;
  description: string;
  logo?: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}
```

### Usage
```tsx
<AdminEntryCard
  id={condition.id}
  name={condition.name}
  description={condition.description}
  logo={condition.logo}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Implementation Details
- Uses a grid layout for consistent sizing
- Maintains aspect ratio for images
- Shows placeholder icon when no logo is present
- Provides clear edit and delete actions
- Includes hover states for better UX
- Follows design system spacing and colors

### Example
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map((item) => (
    <AdminEntryCard
      key={item.id}
      id={item.id}
      name={item.name}
      description={item.description}
      logo={item.logo}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ))}
</div>
```

[Back to Top](#table-of-contents)
