# Modal Components

Modal dialogs and overlay components.

## Table of Contents
- [EditListingModal](#editlistingmodal)
- [EditLocationModal](#editlocationmodal)
- [ContactBox](#contactbox)
- [Common Modal Patterns](#common-modal-patterns)

## EditListingModal
Modal component for editing facility information.

### Features
- Form validation
- Photo management
- Logo management
- Conditions selection
- Substances selection
- Therapies selection
- Real-time updates
- Error handling
- Status preservation

### Props
```typescript
interface EditListingModalProps {
  facility: Facility;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Facility>) => Promise<void>;
}
```

### Usage
```tsx
<EditListingModal
  facility={editingFacility}
  isOpen={isModalOpen}
  onClose={handleClose}
  onSave={handleSave}
/>
```

[Back to Top](#table-of-contents)

## EditLocationModal
Modal component for editing featured location information.

### Features
- Form validation
- Image management
- Order management
- Featured status toggle
- Real-time updates
- Error handling

### Props
```typescript
interface EditLocationModalProps {
  location: FeaturedLocation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FeaturedLocation>) => Promise<void>;
}
```

### Usage
```tsx
<EditLocationModal
  location={editingLocation}
  isOpen={isModalOpen}
  onClose={handleClose}
  onSave={handleSave}
/>
```

[Back to Top](#table-of-contents)

## ContactBox
Displays facility contact information and actions.

### Features
- Contact buttons
- Verification status
- Logo display
- Upgrade prompt
- Contact form
- Social links
- Sticky positioning

### Props
```typescript
interface ContactBoxProps {
  facility: Facility;
}
```

### Usage
```tsx
<ContactBox facility={facility} />
```

[Back to Top](#table-of-contents)

## Common Modal Patterns

### Modal Container
```tsx
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
          {children}
        </div>
      </div>
    </div>
  );
};
```

### Form Handling
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  
  try {
    await onSave(formData);
    onClose();
  } catch (error) {
    setError(error.message);
  } finally {
    setSubmitting(false);
  }
};
```

### Focus Management
```tsx
useEffect(() => {
  if (isOpen) {
    const firstInput = modalRef.current?.querySelector('input, button');
    firstInput?.focus();
  }
}, [isOpen]);

useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

### Form Validation
```tsx
const validate = (data: FormData) => {
  const errors: Record<string, string> = {};
  
  if (!data.name) {
    errors.name = 'Name is required';
  }
  
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  
  return errors;
};
```

[Back to Top](#table-of-contents)
