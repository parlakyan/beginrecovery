import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  StorageError
} from 'firebase/storage';
import { storage } from '../lib/firebase';

interface UploadResult {
  success: true;
  url: string;
}

interface UploadError {
  success: false;
  error: string;
}

/**
 * Storage service for managing file uploads
 */
export const storageService = {
  /**
   * Validate file before upload
   */
  validateFile(file: File): string | null {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  },

  /**
   * Upload a single facility photo
   */
  async uploadFacilityPhoto(facilityId: string, file: File, onProgress?: (progress: number) => void): Promise<string> {
    const error = this.validateFile(file);
    if (error) {
      throw new Error(error);
    }

    try {
      // Create a unique filename
      const extension = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).substring(2)}.${extension}`;
      const photoRef = ref(storage, `facilities/${facilityId}/photos/${filename}`);

      // Upload file
      const snapshot = await uploadBytes(photoRef, file);

      // Get download URL
      const url = await getDownloadURL(snapshot.ref);
      return url;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  /**
   * Upload multiple facility photos
   */
  async uploadFacilityPhotos(facilityId: string, files: File[], onProgress?: (progress: number) => void): Promise<string[]> {
    const uploadPromises = Array.from(files).map(file => 
      this.uploadFacilityPhoto(facilityId, file, onProgress)
    );

    return Promise.all(uploadPromises);
  },

  /**
   * Delete a facility photo
   */
  async deleteFacilityPhoto(url: string): Promise<void> {
    try {
      // Get storage reference from URL
      const photoRef = ref(storage, url);
      await deleteObject(photoRef);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  },

  /**
   * Upload a single image
   * @deprecated Use uploadFacilityPhoto instead
   */
  async uploadImage(file: File, facilityId: string, onProgress?: (progress: number) => void): Promise<UploadResult | UploadError> {
    try {
      const url = await this.uploadFacilityPhoto(facilityId, file, onProgress);
      return { success: true, url };
    } catch (error) {
      return { 
        success: false, 
        error: (error as StorageError).message || 'Failed to upload image' 
      };
    }
  },

  /**
   * Upload multiple images
   * @deprecated Use uploadFacilityPhotos instead
   */
  async uploadImages(files: File[], facilityId: string, onProgress?: (progress: number) => void): Promise<(UploadResult | UploadError)[]> {
    const uploadPromises = Array.from(files).map(file => 
      this.uploadImage(file, facilityId, onProgress)
    );

    return Promise.all(uploadPromises);
  }
};
