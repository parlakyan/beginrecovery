import React, { useRef, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuthStore } from '../store/authStore';

interface LocationImageUploadProps {
  currentImage?: string;
  onUpload: (imageUrl: string) => void;
}

export default function LocationImageUpload({ currentImage, onUpload }: LocationImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user || user.role !== 'admin') {
      setError('Only admins can upload location images');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setUploadProgress(0);

      // Create a unique filename with timestamp
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `location-${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;
      const path = `locations/${fileName}`;

      console.log('Uploading location image:', {
        path,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        userRole: user.role
      });

      // Delete old image if it exists
      if (currentImage) {
        try {
          const url = new URL(currentImage);
          const oldPath = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
          if (oldPath.startsWith('locations/')) {
            console.log('Deleting old location image:', oldPath);
            await storageService.deleteFile(oldPath);
          }
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Upload new image
      const result = await storageService.uploadImage(file, path, (progress) => {
        setUploadProgress(progress);
      });

      if ('error' in result) {
        console.error('Location image upload error:', {
          error: result.error,
          code: result.code,
          path
        });
        setError(result.error);
        return;
      }

      if ('url' in result) {
        console.log('Location image uploaded successfully:', {
          url: result.url.split('?')[0], // Log URL without query params
          path: result.path
        });
        onUpload(result.url);
      }
    } catch (err) {
      console.error('Error uploading location image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    if (!user || user.role !== 'admin') {
      setError('Only admins can remove location images');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Extract path from URL
      const url = new URL(currentImage);
      const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
      
      if (path.startsWith('locations/')) {
        console.log('Removing location image:', {
          path,
          userRole: user.role
        });
        await storageService.deleteFile(path);
        console.log('Location image removed successfully');
      }

      onUpload('');
    } catch (err) {
      console.error('Error removing location image:', err);
      setError('Failed to remove image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Current Image Preview */}
      {currentImage && (
        <div className="relative">
          <img
            src={currentImage}
            alt="Location"
            className="w-full h-48 object-cover rounded-lg"
          />
          <button
            onClick={handleRemove}
            disabled={uploading}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 disabled:opacity-50"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Upload Button */}
      {!currentImage && !uploading && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-sm text-gray-600">Upload Image</span>
            <span className="text-xs text-gray-500">Max size: 5MB</span>
          </button>
        </div>
      )}

      {/* Loading State */}
      {uploading && (
        <div className="w-full h-48 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm text-gray-600">Uploading...</span>
          {uploadProgress > 0 && (
            <div className="w-full max-w-xs mt-2 bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
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
