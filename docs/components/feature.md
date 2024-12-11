# Feature Components

Business logic components that implement specific features.

## Table of Contents
- [ConditionsSection](#conditionssection)
- [TherapiesSection](#therapiessection)
- [InsurancesSection](#insurancessection)
- [CertificationsSection](#certificationssection)
- [LocationBrowser](#locationbrowser)
- [AddressAutocomplete](#addressautocomplete)
- [MapSection](#mapsection)
- [Header](#header)
- [Footer](#footer)

## ConditionsSection
Displays conditions treated by the facility.

### Features
- Condition logos and names
- Description display
- Responsive grid layout
- Loading states
- Verified-only content

### Props
```typescript
interface ConditionsSectionProps {
  conditions: Condition[];
}
```

### Usage
```tsx
<ConditionsSection conditions={facility.conditions} />
```

[Back to Top](#table-of-contents)

## TherapiesSection
Displays available therapies at the facility.

### Features
- Therapy logos and names
- Description display
- Responsive grid layout
- Loading states
- Verified-only content

### Props
```typescript
interface TherapiesSectionProps {
  therapies: Therapy[];
}
```

### Usage
```tsx
<TherapiesSection therapies={facility.therapies} />
```

[Back to Top](#table-of-contents)

## InsurancesSection
Displays insurance providers for verified facilities.

### Features
- Insurance provider logos
- Provider information display
- Verification status check
- Responsive grid layout
- Loading states

### Props
```typescript
interface InsurancesSectionProps {
  insurances: Insurance[];
}
```

### Usage
```tsx
<InsurancesSection insurances={facility.insurances} />
```

[Back to Top](#table-of-contents)

## CertificationsSection
Displays facility certifications and licenses.

### Features
- License logos and names
- Description display
- Verification status
- Responsive grid layout
- Loading states

### Props
```typescript
interface CertificationsSectionProps {
  licenses: License[];
}
```

### Usage
```tsx
<CertificationsSection licenses={facility.licenses} />
```

[Back to Top](#table-of-contents)

## LocationBrowser
Displays and manages featured locations.

### Features
- Location grid display
- Image management
- Featured status toggle
- Order management
- Admin controls

### Props
```typescript
interface LocationBrowserProps {
  locations: FeaturedLocation[];
  onLocationUpdate: (location: FeaturedLocation) => void;
  onLocationDelete: (locationId: string) => void;
}
```

### Usage
```tsx
<LocationBrowser
  locations={featuredLocations}
  onLocationUpdate={handleLocationUpdate}
  onLocationDelete={handleLocationDelete}
/>
```

[Back to Top](#table-of-contents)

## AddressAutocomplete
Google Places address autocomplete input.

### Features
- Address suggestions
- Place details
- Coordinate extraction
- Error handling
- Loading states

### Props
```typescript
interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void;
  error?: string;
  placeholder?: string;
}
```

### Usage
```tsx
<AddressAutocomplete
  value={address}
  onChange={handleAddressChange}
  placeholder="Enter facility address"
/>
```

[Back to Top](#table-of-contents)

## MapSection
Displays facility location on Google Maps.

### Features
- Interactive map
- Custom markers
- Info windows
- Zoom controls
- Mobile responsive

### Props
```typescript
interface MapSectionProps {
  coordinates: {
    lat: number;
    lng: number;
  };
  address: string;
}
```

### Usage
```tsx
<MapSection 
  coordinates={facility.coordinates}
  address={facility.location}
/>
```

[Back to Top](#table-of-contents)

## Header
Main navigation header component.

### Features
- Responsive navigation
- User authentication status
- Admin controls
- Search integration
- Mobile menu
- Transparent mode option

### Props
```typescript
interface HeaderProps {
  transparent?: boolean;
  className?: string;
}
```

### Usage
```tsx
<Header transparent={isHomePage} />
```

[Back to Top](#table-of-contents)

## Footer
Site footer component.

### Features
- Navigation links
- Social media links
- Newsletter signup
- Contact information
- Responsive layout
- Legal links

### Props
```typescript
interface FooterProps {
  className?: string;
}
```

### Usage
```tsx
<Footer />
```

[Back to Top](#table-of-contents)
