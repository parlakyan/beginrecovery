import React, { useCallback, useState, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuthStore } from '../store/authStore';

interface LogoUploadProps {
  facilityId: string;
  existingLogo?: string;
  onLogoChange: (logo: string | undefined) => void;
}

export default function LogoUpload({ 
  facilityId, 
  existingLogo,
  onLogoChange
}: LogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [logo, setLogo] = useState<string | undefined>(existingLogo);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { user } = useAuthStore();

  // Update logo when existingLogo prop changes
  useEffect(() => {
    console.log('Existing logo changed:', existingLogo);
    setLogo(existingLogo);
  }, [existingLogo]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(undefined);

    if (!user) {
      setError('You must be logged in to upload a logo');
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 1) {
      setError('Please upload only one logo image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const file = files[0];

      // Validate file
      const validationError = storageService.validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `logo-${timestamp}.${fileExtension}`;
      const path = `facilities/${facilityId}/logo/${fileName}`;

      console.log('Uploading logo:', {
        facilityId,
        path,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        userRole: user.role,
        userId: user.id
      });

      // First, try to clean up any existing logo
      if (logo) {
        try {
          const oldUrl = new URL(logo);
          const oldPath = decodeURIComponent(oldUrl.pathname.split('/o/')[1].split('?')[0]);
          if (oldPath.startsWith('facilities/')) {
            await storageService.deleteFile(oldPath);
          }
        } catch (err) {
          console.error('Error cleaning up old logo:', err);
          // Continue with upload even if cleanup fails
        }
      }

      const result = await storageService.uploadImage(file, path, (progress: number) => {
        setUploadProgress(progress);
      });

      if ('error' in result) {
        console.error('Logo upload error:', {
          error: result.error,
          code: result.code,
          path
        });
        setError(result.error);
        return;
      }

      if ('url' in result) {
        console.log('Logo uploaded successfully:', {
          url: result.url.split('?')[0], // Log URL without query params
          path: result.path
        });
        setLogo(result.url);
        onLogoChange(result.url);
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [facilityId, onLogoChange, user, logo]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined);

    if (!user) {
      setError('You must be logged in to upload a logo');
      return;
    }

    const files = Array.from(e.target.files || []);
    
    if (files.length > 1) {
      setError('Please select only one logo image');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    try {
      const file = files[0];

      // Validate file
      const validationError = storageService.validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `logo-${timestamp}.${fileExtension}`;
      const path = `facilities/${facilityId}/logo/${fileName}`;

      console.log('Uploading logo:', {
        facilityId,
        path,
        fileName,
        fileSize: file.size,
        fileType: file.type,
        userRole: user.role,
        userId: user.id
      });

      // First, try to clean up any existing logo
      if (logo) {
        try {
          const oldUrl = new URL(logo);
          const oldPath = decodeURIComponent(oldUrl.pathname.split('/o/')[1].split('?')[0]);
          if (oldPath.startsWith('facilities/')) {
            await storageService.deleteFile(oldPath);
          }
        } catch (err) {
          console.error('Error cleaning up old logo:', err);
          // Continue with upload even if cleanup fails
        }
      }

      const result = await storageService.uploadImage(file, path, (progress: number) => {
        setUploadProgress(progress);
      });

      if ('error' in result) {
        console.error('Logo upload error:', {
          error: result.error,
          code: result.code,
          path
        });
        setError(result.error);
        return;
      }

      if ('url' in result) {
        console.log('Logo uploaded successfully:', {
          url: result.url.split('?')[0], // Log URL without query params
          path: result.path
        });
        setLogo(result.url);
        onLogoChange(result.url);
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input value to allow uploading the same file again
      e.target.value = '';
    }
  }, [facilityId, onLogoChange, user, logo]);

  const handleRemoveLogo = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to remove a logo');
      return;
    }

    try {
      if (logo) {
        // Extract path from URL
        const url = new URL(logo);
        const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
        console.log('Removing logo:', {
          path,
          facilityId,
          userRole: user.role,
          userId: user.id
        });
        await storageService.deleteFile(path);
        console.log('Logo removed successfully');
      }
      setLogo(undefined);
      onLogoChange(undefined);
    } catch (err) {
      console.error('Error removing logo:', err);
      setError('Failed to remove logo. Please try again.');
    }
  }, [logo, onLogoChange, facilityId, user]);

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
      {!logo ? (
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
            id="logo-upload"
            disabled={isUploading}
          />
          <label
            htmlFor="logo-upload"
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
                  Drag logo here or <span className="text-blue-500">browse</span>
                </p>
              </>
            )}
          </label>
        </div>
      ) : (
        <div className="relative group w-32 h-32 mx-auto">
          <img
            src={logo}
            alt="Facility logo"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            onClick={handleRemoveLogo}
            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
        <p>Recommended size: 400x400 pixels</p>
      </div>
    </div>
  );
}
