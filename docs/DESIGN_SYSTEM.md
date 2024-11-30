# Recovery Directory Design System Documentation

## Table of Contents
- [Brand Guidelines](#brand-guidelines)
- [Design System](#design-system)
- [Component Library](#component-library)
- [Project Structure](#project-structure)
- [Implementation Status](#implementation-status)
- [Code Conventions](#code-conventions)

## Brand Guidelines

### Colors
```css
/* Primary Colors */
--primary-blue: #2563eb;     /* blue-600 */
--primary-hover: #1d4ed8;    /* blue-700 */
--primary-light: #dbeafe;    /* blue-100 */

/* Neutral Colors */
--gray-900: #111827;         /* Text */
--gray-600: #4B5563;         /* Secondary Text */
--gray-100: #F3F4F6;         /* Backgrounds */
--white: #FFFFFF;

/* Surface Colors */
--surface: #f3f4f6;          /* Default surface color */
--surface-light: #f9fafb;    /* Lighter variant */
--surface-hover: #f3f4f6;    /* Hover state */
--surface-active: #e5e7eb;   /* Active/pressed state */

/* Semantic Colors */
--success: #22c55e;          /* green-600 */
--error: #ef4444;            /* red-600 */
--warning: #f59e0b;          /* amber-500 */
```

### Typography
```css
/* Font Family */
font-family: system-ui, -apple-system, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing
```css
/* Spacing Scale (rem) */
--space-1: 0.25rem;    /* 4px */
--space-2: 0.5rem;     /* 8px */
--space-3: 0.75rem;    /* 12px */
--space-4: 1rem;       /* 16px */
--space-6: 1.5rem;     /* 24px */
--space-8: 2rem;       /* 32px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
```

### Border Radius
```css
--radius-sm: 0.125rem;    /* 2px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-full: 9999px;    /* Full rounded */
```

## Component Library

### Core Components

#### Logo
```tsx
<Logo />  // SVG logo with responsive sizing
```

#### Button Variants
```tsx
// Primary Button
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
  Primary Action
</button>

// Secondary Button
<button className="border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
  Secondary Action
</button>

// Icon Button
<button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
  <Icon className="w-5 h-5" />
</button>
```

#### Form Elements
```tsx
// Input Field
<input 
  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
  type="text"
/>

// Select
<select className="w-full px-4 py-2 border rounded-lg">
  <option>Option 1</option>
</select>

// Checkbox
<label className="flex items-center gap-2">
  <input type="checkbox" className="rounded text-blue-600" />
  <span>Label</span>
</label>
```

#### Cards
```tsx
// Basic Card
<div className="bg-white rounded-xl shadow-sm p-6">
  <h2 className="text-xl font-bold mb-4">Title</h2>
  <p className="text-gray-600">Content</p>
</div>

// Interactive Card
<div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-6 cursor-pointer">
  {/* Card content */}
</div>

// Surface Card
<div className="bg-surface rounded-lg p-6">
  <h2 className="text-xl font-semibold text-gray-900">Title</h2>
  <p className="text-gray-900">Content</p>
  <a className="text-blue-600 hover:text-blue-700 font-semibold">Link</a>
</div>
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── services/           # API and external services
├── store/             # State management
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
├── types/             # TypeScript type definitions
└── lib/               # Third-party library configurations
```

## Implementation Status

### Completed Features
- ✅ User Authentication (Login/Register/Reset Password)
- ✅ Facility Listings
- ✅ Search & Filters
- ✅ Payment Integration
- ✅ Responsive Design
- ✅ Admin Dashboard Structure

### In Progress
- 🟡 Facility Management
- 🟡 Review System
- 🟡 Insurance Verification

### Planned Features
- ⭕ Chat System
- ⭕ Advanced Analytics
- ⭕ Multi-language Support
- ⭕ Mobile App Version

## Code Conventions

### TypeScript
- Use TypeScript for all new files
- Define interfaces for all props and state
- Use type inference where possible
- Avoid `any` type

### Component Structure
```tsx
// Component naming: PascalCase
export default function ComponentName() {
  // 1. Hooks
  const [state, setState] = useState();
  
  // 2. Derived state
  const computed = useMemo(() => {}, []);
  
  // 3. Effects
  useEffect(() => {}, []);
  
  // 4. Event handlers
  const handleEvent = () => {};
  
  // 5. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

### File Organization
- One component per file
- Group related components in folders
- Use index.ts for exports
- Keep files under 300 lines

### Naming Conventions
- Components: PascalCase
- Files: PascalCase for components, camelCase for others
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
- CSS Classes: kebab-case

### Best Practices
- Use functional components with hooks
- Implement error boundaries
- Lazy load routes and heavy components
- Use proper TypeScript types
- Write unit tests for critical functionality
- Follow accessibility guidelines
- Implement proper error handling
- Use proper SEO meta tags
