# Components Documentation

The components documentation has been reorganized into separate files for better maintainability:

## Documentation Structure

- [Overview & Guidelines](./components/README.md) - Component organization and common patterns
- [Authentication Components](./AUTHENTICATION.md#components) - Auth and access control
- [UI Components](./components/ui.md) - Core UI building blocks
- [Upload Components](./components/upload.md) - File upload handling
- [Feature Components](./components/feature.md) - Business logic components
- [Search Components](./components/search.md) - Search and filtering functionality
- [Modal Components](./components/modal.md) - Modal dialogs and overlays

## Quick Links

### Authentication Components
- [Login Form](./AUTHENTICATION.md#login-form)
- [Register Form](./AUTHENTICATION.md#register-form)
- [Reset Password Form](./AUTHENTICATION.md#reset-password-form)
- [Protected Route](./AUTHENTICATION.md#protected-route)
- [Role-Based Access](./AUTHENTICATION.md#role-based-access)

### UI Components
- [Button](./components/ui.md#button)
- [Tag](./components/ui.md#tag)
- [DropdownSelect](./components/ui.md#dropdownselect)
- [MultiSelect](./components/ui.md#multiselect)
- [Tabs](./components/ui.md#tabs)
- [Breadcrumb](./components/ui.md#breadcrumb)
- [ImageCarousel](./components/ui.md#imagecarousel)

### Upload Components
- [AdminLogoUpload](./components/upload.md#adminlogoupload)
- [LogoUpload](./components/upload.md#logoupload)
- [PhotoUpload](./components/upload.md#photoupload)
- [LocationImageUpload](./components/upload.md#locationimageupload)

### Feature Components
- [ConditionsSection](./components/feature.md#conditionssection)
- [TherapiesSection](./components/feature.md#therapiessection)
- [InsurancesSection](./components/feature.md#insurancessection)
- [CertificationsSection](./components/feature.md#certificationssection)
- [LocationBrowser](./components/feature.md#locationbrowser)
- [AddressAutocomplete](./components/feature.md#addressautocomplete)
- [MapSection](./components/feature.md#mapsection)

### Search Components
- [FilterBar](./components/search.md#filterbar)
- [SearchResults](./components/search.md#searchresults)
- [RehabCard](./components/search.md#rehabcard)
- [FeaturedCarousel](./components/search.md#featuredcarousel)

### Modal Components
- [EditListingModal](./components/modal.md#editlistingmodal)
- [EditLocationModal](./components/modal.md#editlocationmodal)
- [ContactBox](./components/modal.md#contactbox)

## Component Guidelines

### Authentication Integration
For components that require authentication or role-based access:
1. Use the Protected Route wrapper
2. Check user roles appropriately
3. Handle loading states
4. Manage auth errors
5. Follow security best practices

See the [Authentication Documentation](./AUTHENTICATION.md) for detailed implementation guidelines.

### State Management
For components that interact with auth state:
1. Use the auth store correctly
2. Handle token refresh
3. Manage permissions
4. Handle session expiry
5. Clean up on logout

See the [Auth Store Documentation](./AUTHENTICATION.md#auth-store) for implementation details.

### General Guidelines
For detailed guidelines on component development, testing, and best practices, see the [Overview & Guidelines](./components/README.md) documentation.
