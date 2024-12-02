import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';

interface PhotoUploadProps {
  facilityId: string;
  existingPhotos?: string[];
  onPhotosChange: (photos: string[]) => void;
  isVerified?: boolean;
}

/**
 * PhotoUpload component
 * Handles photo upload functionality with:
 * - Drag and drop support
 * - Preview thumbnails
 * - Upload progress
 * - 12 photo limit
 * - File type and size validation
 */
export default function PhotoUpload({ 
  facilityId, 
  existingPhotos = [], 
  onPhotosChange,
  isVerified = false
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const maxPhotos = 12;
  const remainingSlots = maxPhotos - photos.length;

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > remainingSlots) {
      setError(`You can only add ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const results = await storageService.uploadImages(files, facilityId);
      const uploadedUrls = results
        .filter((result): result is { url: string } => 'url' in result)
        .map(result => result.url);

      const errors = results
        .filter((result): result is { error: string } => 'error' in result)
        .map(result => result.error);

      if (errors.length > 0) {
        setError(errors.join(', '));
      }

      if (uploadedUrls.length > 0) {
        const newPhotos = [...photos, ...uploadedUrls];
        setPhotos(newPhotos);
        onPhotosChange(newPhotos);
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [facilityId, photos, remainingSlots, onPhotosChange]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    
    if (files.length > remainingSlots) {
      setError(`You can only add ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'}`);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const results = await storageService.uploadImages(files, facilityId);
      const uploadedUrls = results
        .filter((result): result is { url: string } => 'url' in result)
        .map(result => result.url);

      const errors = results
        .filter((result): result is { error: string } => 'error' in result)
        .map(result => result.error);

      if (errors.length > 0) {
        setError(errors.join(', '));
      }

      if (uploadedUrls.length > 0) {
        const newPhotos = [...photos, ...uploadedUrls];
        setPhotos(newPhotos);
        onPhotosChange(newPhotos);
      }
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  }, [facilityId, photos, remainingSlots, onPhotosChange]);

  const handleRemovePhoto = useCallback((index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  }, [photos, onPhotosChange]);

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
      {photos.length < maxPhotos && (
        <div
          onDrop={handleDrop}
          onDragOver={dragOverHandler}
          onDragLeave={dragLeaveHandler}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
        >
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="photo-upload"
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
                <p className="mt-1 text-xs text-gray-500">
                  {remainingSlots} slot{remainingSlots === 1 ? '' : 's'} remaining
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((url, index) => (
            <div key={url} className="relative group aspect-square">
              <img
                src={url}
                alt={`Facility photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500">
        <p>Supported formats: JPEG, PNG, WebP</p>
        <p>Maximum file size: 5MB</p>
        <p>Maximum photos: {maxPhotos}</p>
        {!isVerified && (
          <p className="text-blue-600">
            Note: Only the first photo will be displayed for unverified listings
          </p>
        )}
      </div>
    </div>
  );
}
