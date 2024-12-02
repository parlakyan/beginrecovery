import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../lib/firebase';

const storage = getStorage(app);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PHOTOS = 12;

interface UploadResult {
  url: string;
  error?: never;
}

interface UploadError {
  url?: never;
  error: string;
}

/**
 * Storage service for handling file uploads
 * Supports image uploads with validation for:
 * - File type (JPEG, PNG, WebP)
 * - File size (max 5MB)
 * - Number of files (max 12 photos per listing)
 */
export const storageService = {
  /**
   * Validates a file before upload
   */
  validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file type. Please upload JPEG, PNG, or WebP images.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'File too large. Maximum size is 5MB.';
    }

    return null;
  },

  /**
   * Uploads a single image file to Firebase Storage
   */
  async uploadImage(file: File, facilityId: string): Promise<UploadResult | UploadError> {
    try {
      const validationError = this.validateFile(file);
      if (validationError) {
        return { error: validationError };
      }

      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${facilityId}/${timestamp}-${file.name}`;
      const storageRef = ref(storage, `facilities/${filename}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const url = await getDownloadURL(storageRef);
      return { url };
    } catch (error) {
      console.error('Error uploading image:', error);
      return { error: 'Failed to upload image. Please try again.' };
    }
  },

  /**
   * Uploads multiple image files to Firebase Storage
   * Limits the total number of photos to MAX_PHOTOS
   */
  async uploadImages(files: File[], facilityId: string): Promise<(UploadResult | UploadError)[]> {
    if (files.length > MAX_PHOTOS) {
      return [{ error: `Maximum ${MAX_PHOTOS} photos allowed.` }];
    }

    const uploadPromises = Array.from(files).map(file => 
      this.uploadImage(file, facilityId)
    );

    return Promise.all(uploadPromises);
  }
};
