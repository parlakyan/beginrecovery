import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';

interface LocationImageUploadProps {
  locationId: string;
  existingImage?: string;
  onImageChange: (image: string | undefined) => void;
}

/**
 * LocationImageUpload component
 * Handles location image upload with:
 * - Drag and drop support
 * - Preview
 * - Upload progress
 * - File type and size validation
 */
export default function LocationImageUpload({ 
  locationId, 
  existingImage,
  onImageChange
}: LocationImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [image, setImage] = useState<string | undefined>(existingImage);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Update image when existingImage prop changes
  useEffect(() => {
    console.log('Existing image changed:', existingImage);
    setImage(existingImage);
  }, [existingImage]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(undefined);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setError('Please upload only one image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      console.log('Uploading image to path:', `locations/${locationId}/image`);
      const results = await storageService.uploadImages(files, `locations/${locationId}/image`);
      const uploadedUrl = results[0];

      if ('error' in uploadedUrl) {
        setError(uploadedUrl.error);
        return;
      }

      if ('url' in uploadedUrl) {
        console.log('Image uploaded successfully:', uploadedUrl.url);
        setImage(uploadedUrl.url);
        onImageChange(uploadedUrl.url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [locationId, onImageChange]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined);
    const files = Array.from(e.target.files || []);
    
    if (files.length > 1) {
      setError('Please select only one image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      console.log('Uploading image to path:', `locations/${locationId}/image`);
      const results = await storageService.uploadImages(files, `locations/${locationId}/image`);
      const uploadedUrl = results[0];

      if ('error' in uploadedUrl) {
        setError(uploadedUrl.error);
        return;
      }

      if ('url' in uploadedUrl) {
        console.log('Image uploaded successfully:', uploadedUrl.url);
        setImage(uploadedUrl.url);
        onImageChange(uploadedUrl.url);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  }, [locationId, onImageChange]);

  const handleRemoveImage = useCallback(async (e: React.MouseEvent) => {
    // Stop event from bubbling up to parent elements
    e.stopPropagation();
    e.preventDefault();

    try {
      console.log('Removing image files from storage');
      await storageService.deleteFiles(`locations/${locationId}/image`);
      console.log('Image files deleted successfully');
      
      setImage(undefined);
      onImageChange(undefined);
    } catch (err) {
      console.error('Error removing image:', err);
      setError('Failed to remove image. Please try again.');
    }
  }, [locationId, onImageChange]);

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
      {!image ? (
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
            id="location-image-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="location-image-upload"
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
                  Drag image here or <span className="text-blue-500">browse</span>
                </p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="relative w-full h-48 rounded-lg overflow-hidden">
          <img
            src={image}
            alt="Location"
            className="w-full h-full object-cover"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
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
        <p>Maximum file size: 5MB</p>
        <p>Recommended size: 1200x800 pixels</p>
      </div>
    </div>
  );
}
