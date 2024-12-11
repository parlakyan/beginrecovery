# Upload Components

Components for handling file uploads in the application.

## Table of Contents
- [AdminLogoUpload](#adminlogoupload)
- [LogoUpload](#logoupload)
- [PhotoUpload](#photoupload)
- [LocationImageUpload](#locationimageupload)

## AdminLogoUpload
Handles logo uploads for admin-managed content (licenses, insurances, conditions, substances, therapies).

### Features
- Drag and drop support
- Image preview
- File validation
- Upload progress
- Logo removal
- Admin-only access
- Multiple folder support

### Props
```typescript
interface AdminLogoUploadProps {
  currentLogo?: string;
  onUpload: (url: string) => void;
  folder: 'licenses' | 'insurances' | 'locations' | 'conditions' | 'substances' | 'therapies';
}
```

### Usage
```tsx
<AdminLogoUpload
  currentLogo={logo}
  onUpload={handleLogoUpload}
  folder="conditions"
/>
```

[Back to Top](#table-of-contents)

## LogoUpload
Handles facility logo upload and management.

### Features
- Drag and drop support
- Image preview
- File validation
- Upload progress
- Logo removal
- Storage cleanup

### Props
```typescript
interface LogoUploadProps {
  facilityId: string;
  existingLogo?: string;
  onLogoChange: (logo: string | undefined) => void;
}
```

### Usage
```tsx
<LogoUpload 
  facilityId={facility.id}
  existingLogo={facility.logo}
  onLogoChange={handleLogoChange}
/>
```

[Back to Top](#table-of-contents)

## PhotoUpload
Handles facility photo uploads and management.

### Features
- Multiple file upload
- Drag and drop support
- Image preview
- File validation
- Upload progress
- Photo removal
- Storage cleanup
- Order management

### Props
```typescript
interface PhotoUploadProps {
  facilityId: string;
  existingPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}
```

### Usage
```tsx
<PhotoUpload
  facilityId={facility.id}
  existingPhotos={facility.images}
  onPhotosChange={handlePhotosChange}
  maxPhotos={10}
/>
```

[Back to Top](#table-of-contents)

## LocationImageUpload
Handles location image uploads for featured locations.

### Features
- Single image upload
- Drag and drop support
- Image preview
- File validation
- Upload progress
- Image removal
- Storage cleanup
- Aspect ratio enforcement

### Props
```typescript
interface LocationImageUploadProps {
  locationId: string;
  existingImage?: string;
  onImageChange: (image: string | undefined) => void;
}
```

### Usage
```tsx
<LocationImageUpload
  locationId={location.id}
  existingImage={location.image}
  onImageChange={handleImageChange}
/>
```

[Back to Top](#table-of-contents)

## Common Upload Patterns

### File Validation
```typescript
const validateFile = (file: File) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
  }
  
  if (file.size > maxSize) {
    throw new Error('File too large. Maximum size is 5MB.');
  }
};
```

### Progress Tracking
```typescript
const [uploadProgress, setUploadProgress] = useState(0);

const handleUpload = async (file: File) => {
  const uploadTask = storageRef.child(path).put(file);
  
  uploadTask.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      setUploadProgress(progress);
    }
  );
};
```

### Drag and Drop
```typescript
const [isDragging, setIsDragging] = useState(false);

const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);
  
  const files = Array.from(e.dataTransfer.files);
  handleFiles(files);
};
```

[Back to Top](#table-of-contents)
