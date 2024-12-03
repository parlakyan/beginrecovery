import React, { useState } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
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
  maxPhotos
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    // Check if adding new files would exceed maxPhotos
    if (maxPhotos && existingPhotos.length + files.length > maxPhotos) {
      setError(`Maximum ${maxPhotos} photo${maxPhotos === 1 ? '' : 's'} allowed`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const uploadPromises = Array.from(files).map(file => 
        storageService.uploadFacilityPhoto(facilityId, file)
      );

      const newUrls = await Promise.all(uploadPromises);
      onPhotosChange([...existingPhotos, ...newUrls]);
    } catch (err) {
      console.error('Error uploading photos:', err);
      setError('Failed to upload photos. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (urlToRemove: string) => {
    try {
      await storageService.deleteFacilityPhoto(urlToRemove);
      onPhotosChange(existingPhotos.filter(url => url !== urlToRemove));
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Failed to remove photo. Please try again.');
    }
  };

  const remainingPhotos = maxPhotos ? maxPhotos - existingPhotos.length : undefined;

  return (
    <div className="space-y-4">
      {/* Photo Grid */}
      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {existingPhotos.map((url) => (
            <div key={url} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
              <img 
                src={url} 
                alt="Facility" 
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemove(url)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {(!maxPhotos || remainingPhotos! > 0) && (
        <div>
          <label className="relative block">
            <input
              type="file"
              accept="image/*"
              multiple={!maxPhotos || maxPhotos > 1}
              onChange={handleFileChange}
              disabled={uploading || !isVerified}
              className="hidden"
            />
            <div 
              className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                uploading ? 'bg-gray-50' : 'hover:bg-gray-50'
              } ${!isVerified ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-blue-600" />
              )}
              <span className="mt-2 text-sm text-gray-600">
                {uploading ? 'Uploading...' : (
                  maxPhotos 
                    ? `Upload up to ${remainingPhotos} more photo${remainingPhotos === 1 ? '' : 's'}`
                    : 'Click to upload photos'
                )}
              </span>
              {!isVerified && (
                <span className="mt-1 text-xs text-gray-500">
                  Verify your listing to upload photos
                </span>
              )}
            </div>
          </label>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
