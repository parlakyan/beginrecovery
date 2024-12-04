import React, { useCallback, useState } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { storageService } from '../services/storage';
import { useAuthStore } from '../store/authStore';

interface AdminLogoUploadProps {
  currentLogo?: string;
  onUpload: (url: string) => void;
  folder: 'licenses' | 'insurances' | 'locations';
}

export default function AdminLogoUpload({ 
  currentLogo,
  onUpload,
  folder
}: AdminLogoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { user } = useAuthStore();

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setError(undefined);

    if (!user || user.role !== 'admin') {
      setError('Only admins can upload logos');
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
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${timestamp}.${fileExtension}`;
      const path = `${folder}/${fileName}`;
      
      const result = await storageService.uploadImage(file, path, (progress) => {
        setUploadProgress(progress);
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      if ('url' in result) {
        onUpload(result.url);
      }
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Failed to upload logo. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [folder, onUpload, user]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(undefined);

    if (!user || user.role !== 'admin') {
      setError('Only admins can upload logos');
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
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `${timestamp}.${fileExtension}`;
      const path = `${folder}/${fileName}`;

      const result = await storageService.uploadImage(file, path, (progress) => {
        setUploadProgress(progress);
      });

      if ('error' in result) {
        setError(result.error);
        return;
      }

      if ('url' in result) {
        onUpload(result.url);
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
  }, [folder, onUpload, user]);

  const handleRemoveLogo = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user || user.role !== 'admin') {
      setError('Only admins can remove logos');
      return;
    }

    try {
      if (currentLogo) {
        // Extract path from URL
        const url = new URL(currentLogo);
        const path = decodeURIComponent(url.pathname.split('/o/')[1].split('?')[0]);
        await storageService.deleteFile(path);
      }
      onUpload('');
    } catch (err) {
      console.error('Error removing logo:', err);
      setError('Failed to remove logo. Please try again.');
    }
  }, [currentLogo, onUpload, user]);

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
      {!currentLogo ? (
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
            src={currentLogo}
            alt="Logo"
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
