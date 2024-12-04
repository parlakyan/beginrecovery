import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';

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
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(null);

    const files = Array.from(e.dataTransfer.files);
    if (maxPhotos && files.length + existingPhotos.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setIsUploading(true);
    try {
      const results = await storageService.uploadImages(
        files, 
        `facilities/${facilityId}/photos`,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Check for any errors
      const errors = results.filter((result): result is { error: string } => 
        'error' in result
      );

      if (errors.length > 0) {
        setError(errors[0].error);
        return;
      }

      // Get successful uploads
      const urls = results
        .filter((result): result is { url: string; path: string } => 'url' in result)
        .map(result => result.url);

      onPhotosChange([...existingPhotos, ...urls]);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [maxPhotos, existingPhotos, onPhotosChange, facilityId]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = Array.from(e.target.files || []);
    
    if (maxPhotos && files.length + existingPhotos.length > maxPhotos) {
      setError(`You can only upload up to ${maxPhotos} photos`);
      return;
    }

    setIsUploading(true);
    try {
      const results = await storageService.uploadImages(
        files, 
        `facilities/${facilityId}/photos`,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      // Check for any errors
      const errors = results.filter((result): result is { error: string } => 
        'error' in result
      );

      if (errors.length > 0) {
        setError(errors[0].error);
        return;
      }

      // Get successful uploads
      const urls = results
        .filter((result): result is { url: string; path: string } => 'url' in result)
        .map(result => result.url);

      onPhotosChange([...existingPhotos, ...urls]);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  }, [maxPhotos, existingPhotos, onPhotosChange, facilityId]);

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
          multiple
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
              {!isVerified && (
                <p className="mt-1 text-xs text-gray-500">
                  Upgrade to verified to upload more than 1 photo
                </p>
              )}
            </>
          )}
        </label>
      </div>

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
        <p>Maximum photos: {isVerified ? maxPhotos : 1}</p>
      </div>
    </div>
  );
}
