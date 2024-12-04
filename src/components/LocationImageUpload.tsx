import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface LocationImageUploadProps {
  currentImage?: string;
  onUpload: (imageUrl: string) => void;
}

export default function LocationImageUpload({ currentImage, onUpload }: LocationImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Delete old image if it exists
      if (currentImage) {
        try {
          const oldImageRef = ref(storage, currentImage);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      // Create a unique filename
      const filename = `locations/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadUrl = await getDownloadURL(storageRef);

      // Call the onUpload callback with the URL
      onUpload(downloadUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!currentImage) return;

    try {
      setUploading(true);
      setError(null);

      // Delete the image from storage
      const imageRef = ref(storage, currentImage);
      await deleteObject(imageRef);

      // Clear the image URL
      onUpload('');
    } catch (error) {
      console.error('Error removing image:', error);
      setError('Failed to remove image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
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
            accept="image/*"
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
        </div>
      )}
    </div>
  );
}
