import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { storageService, UploadResult, UploadError } from '../services/storage';
import { useAuthStore } from '../store/authStore';

interface PhotoUploadProps {
  facilityId: string;
  existingPhotos: string[];
  onPhotosChange: (photos: string[]) => void;
  isVerified: boolean;
  maxPhotos?: number;
}

export default function PhotoUpload({ 
  facilityId,
  existingPhotos,
  onPhotosChange,
  isVerified,
  maxPhotos = 10
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuthStore();

  // Check if user can upload multiple photos
  const canUploadMultiple = user?.role === 'admin' || isVerified;
  const photoLimit = canUploadMultiple ? maxPhotos : 1;

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be logged in to upload photos');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    // Check photo limit based on verification status and role
    if (!canUploadMultiple && files.length + existingPhotos.length > 1) {
      setError(`Upgrade to verified to upload more than 1 photo`);
      return;
    }

    if (maxPhotos && files.length + existingPhotos.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file
        const validationError = storageService.validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `photo-${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const path = `facilities/${facilityId}/photos/${fileName}`;

        console.log('Uploading photo:', {
          facilityId,
          path,
          fileName,
          fileSize: file.size,
          fileType: file.type,
          userRole: user.role,
          userId: user.id
        });

        return storageService.uploadImage(file, path, (progress: number) => {
          setUploadProgress(progress);
        });
      });

      const results = await Promise.all(uploadPromises);

      // Check for any errors
      const errors = results.filter((result): result is UploadError => 
        'error' in result
      );

      if (errors.length > 0) {
        console.error('Photo upload errors:', errors);
        setError(errors[0].error);
        return;
      }

      // Get successful uploads
      const urls = results
        .filter((result): result is UploadResult => 'url' in result)
        .map(result => result.url);

      console.log('Photos uploaded successfully:', {
        count: urls.length,
        urls: urls.map(url => url.split('?')[0]) // Log URLs without query params
      });

      onPhotosChange([...existingPhotos, ...urls]);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [maxPhotos, existingPhotos, onPhotosChange, facilityId, canUploadMultiple, user]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    
    if (!user) {
      setError('You must be logged in to upload photos');
      return;
    }

    const files = Array.from(e.target.files || []);
    
    // Check photo limit based on verification status and role
    if (!canUploadMultiple && files.length + existingPhotos.length > 1) {
      setError(`Upgrade to verified to upload more than 1 photo`);
      return;
    }

    if (maxPhotos && files.length + existingPhotos.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file
        const validationError = storageService.validateFile(file);
        if (validationError) {
          throw new Error(validationError);
        }

        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
        const fileName = `photo-${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
        const path = `facilities/${facilityId}/photos/${fileName}`;

        console.log('Uploading photo:', {
          facilityId,
          path,
          fileName,
          fileSize: file.size,
          fileType: file.type,
          userRole: user.role,
          userId: user.id
        });

        return storageService.uploadImage(file, path, (progress: number) => {
          setUploadProgress(progress);
        });
      });

      const results = await Promise.all(uploadPromises);

      // Check for any errors
      const errors = results.filter((result): result is UploadError => 
        'error' in result
      );

      if (errors.length > 0) {
        console.error('Photo upload errors:', errors);
        setError(errors[0].error);
        return;
      }

      // Get successful uploads
      const urls = results
        .filter((result): result is UploadResult => 'url' in result)
        .map(result => result.url);

      console.log('Photos uploaded successfully:', {
        count: urls.length,
        urls: urls.map(url => url.split('?')[0]) // Log URLs without query params
      });

      onPhotosChange([...existingPhotos, ...urls]);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  }, [maxPhotos, existingPhotos, onPhotosChange, facilityId, canUploadMultiple, user]);

  const handleRemovePhoto = useCallback(async (photoUrl: string) => {
    try {
      setIsRemoving(photoUrl);
      setError(null);

      // First update the UI to remove the photo
      const updatedPhotos = existingPhotos.filter(p => p !== photoUrl);
      onPhotosChange(updatedPhotos);

      // Then try to delete from storage
      try {
        // Extract path from URL
        const url = new URL(photoUrl);
        const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
        console.log('Removing photo:', {
          path,
          facilityId,
          userRole: user?.role,
          userId: user?.id
        });

        await storageService.deleteFile(path);
        console.log('Photo removed successfully');
      } catch (err) {
        console.error('Error removing photo from storage:', err);
        // Don't show error to user since the photo is already removed from UI
        // and will be cleaned up by storage rules eventually
      }
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Failed to remove photo. Please try again.');
      // Restore the photo in the UI
      onPhotosChange(existingPhotos);
    } finally {
      setIsRemoving(null);
    }
  }, [existingPhotos, onPhotosChange, facilityId, user]);

  const dragOverHandler = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
  }, []);

  const dragLeaveHandler = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={dragOverHandler}
        onDragLeave={dragLeaveHandler}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          id="photo-upload"
          multiple={canUploadMultiple}
          disabled={isUploading}
        />
        <label
          htmlFor="photo-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <p className="mt-2 text-sm text-gray-600">Uploading...</p>
              {uploadProgress > 0 && (
                <div className="w-full max-w-xs mt-2 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-blue-500" />
              <p className="mt-2 text-sm text-gray-600">
                Drag photos here or <span className="text-blue-500">browse</span>
              </p>
              {!canUploadMultiple && (
                <p className="mt-1 text-xs text-gray-500">
                  Upgrade to verified to upload more than 1 photo
                </p>
              )}
            </>
          )}
        </label>
      </div>

      {/* Photo Grid */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {existingPhotos.map((photo, index) => (
            <div key={photo} className="relative group aspect-square">
              <img
                src={photo}
                alt={`Facility photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemovePhoto(photo)}
                disabled={isRemoving === photo}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                {isRemoving === photo ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>Supported formats: JPEG, PNG, WebP</p>
        <p>Maximum file size: 5MB per photo</p>
        <p>Maximum photos: {photoLimit}</p>
        {!canUploadMultiple && existingPhotos.length === 0 && (
          <p>You can upload 1 photo. Upgrade to verified to upload more.</p>
        )}
      </div>
    </div>
  );
}
