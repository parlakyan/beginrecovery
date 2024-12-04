import { getStorage, ref, uploadBytesResumable, getDownloadURL, listAll, deleteObject } from 'firebase/storage';
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

interface MoveFilesResult {
  movedFiles: {
    oldUrl: string;
    newUrl: string;
  }[];
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
   * Uploads a single image file to Firebase Storage with progress tracking
   */
  async uploadImage(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResult | UploadError> {
    try {
      const validationError = this.validateFile(file);
      if (validationError) {
        return { error: validationError };
      }

      // Create a unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const filename = `${path}/${timestamp}-${randomString}-${safeFileName}`;
      
      // Create storage reference
      const storageRef = ref(storage, filename);

      // Create file metadata
      const metadata = {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000'
      };

      // Start upload with progress monitoring
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      return new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress?.(progress);
          },
          (error) => {
            // Handle upload errors
            console.error('Upload error:', error);
            resolve({ error: 'Failed to upload image. Please try again.' });
          },
          async () => {
            try {
              // Get download URL after successful upload
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url });
            } catch (error) {
              console.error('Error getting download URL:', error);
              resolve({ error: 'Failed to get image URL. Please try again.' });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      return { error: 'Failed to upload image. Please try again.' };
    }
  },

  /**
   * Uploads multiple image files to Firebase Storage
   * Limits the total number of photos to MAX_PHOTOS
   */
  async uploadImages(
    files: File[], 
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<(UploadResult | UploadError)[]> {
    if (files.length > MAX_PHOTOS) {
      return [{ error: `Maximum ${MAX_PHOTOS} photos allowed.` }];
    }

    // Upload files sequentially to prevent overwhelming the network
    const results: (UploadResult | UploadError)[] = [];
    let totalProgress = 0;

    for (const [index, file] of files.entries()) {
      const result = await this.uploadImage(
        file,
        path,
        (progress) => {
          // Calculate overall progress
          const fileProgress = progress / files.length;
          const previousFilesProgress = (index * 100) / files.length;
          totalProgress = previousFilesProgress + fileProgress;
          onProgress?.(totalProgress);
        }
      );

      results.push(result);
      
      // Break early if there's an error
      if ('error' in result) {
        break;
      }
    }

    return results;
  },

  /**
   * Moves files from one location to another in Firebase Storage
   * Returns the new download URLs for the moved files
   */
  async moveFiles(fromPath: string, toPath: string): Promise<MoveFilesResult> {
    try {
      // List all files in the source directory
      const fromRef = ref(storage, fromPath);
      const filesList = await listAll(fromRef);
      const movedFiles: MoveFilesResult['movedFiles'] = [];

      // Move each file
      for (const fileRef of filesList.items) {
        try {
          // Get the file name
          const fileName = fileRef.name;
          
          // Get the download URL of the original file
          const oldUrl = await getDownloadURL(fileRef);

          // Fetch the file content
          const response = await fetch(oldUrl);
          const blob = await response.blob();

          // Create a reference to the new location
          const toRef = ref(storage, `${toPath}/${fileName}`);

          // Upload to new location
          await uploadBytesResumable(toRef, blob, {
            contentType: blob.type,
            cacheControl: 'public, max-age=31536000'
          });

          // Get the new download URL
          const newUrl = await getDownloadURL(toRef);

          // Delete the original file
          await deleteObject(fileRef);

          movedFiles.push({ oldUrl, newUrl });
        } catch (error) {
          console.error(`Error moving file ${fileRef.name}:`, error);
        }
      }

      return { movedFiles };
    } catch (error) {
      console.error('Error moving files:', error);
      throw error;
    }
  },

  /**
   * Deletes all files in a directory
   */
  async deleteFiles(path: string): Promise<void> {
    try {
      console.log('Deleting files from path:', path);
      const dirRef = ref(storage, path);
      const filesList = await listAll(dirRef);

      // Delete each file
      for (const fileRef of filesList.items) {
        try {
          await deleteObject(fileRef);
          console.log('Deleted file:', fileRef.fullPath);
        } catch (error) {
          console.error(`Error deleting file ${fileRef.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Error deleting files:', error);
      throw error;
    }
  }
};
