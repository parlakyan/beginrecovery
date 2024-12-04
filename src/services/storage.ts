import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  error: string;
}

export const storageService = {
  validateFile(file: File): string | null {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'Please upload an image file';
    }

    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return 'File size must be less than 5MB';
    }

    return null;
  },

  async uploadImage(
    file: File, 
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult | UploadError> {
    const error = this.validateFile(file);
    if (error) {
      return { error };
    }

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            console.error('Upload error:', error);
            reject({ error: 'Failed to upload file' });
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({ url, path });
            } catch (error) {
              console.error('Error getting download URL:', error);
              reject({ error: 'Failed to get download URL' });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error starting upload:', error);
      return { error: 'Failed to start upload' };
    }
  },

  async uploadImages(
    files: File[], 
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<(UploadResult | UploadError)[]> {
    return Promise.all(
      files.map((file, index) => 
        this.uploadImage(
          file, 
          `${path}/${index}-${file.name}`,
          onProgress
        )
      )
    );
  },

  async moveFiles(fromPath: string, toPath: string): Promise<void> {
    try {
      const fromRef = ref(storage, fromPath);
      const listResult = await listAll(fromRef);

      // Move each file
      await Promise.all(listResult.items.map(async (itemRef) => {
        const newPath = itemRef.fullPath.replace(fromPath, toPath);
        const newRef = ref(storage, newPath);

        // Download URL of the original file
        const url = await getDownloadURL(itemRef);

        // Fetch the file
        const response = await fetch(url);
        const blob = await response.blob();

        // Upload to new location
        await uploadBytesResumable(newRef, blob);

        // Delete original
        await deleteObject(itemRef);
      }));
    } catch (error) {
      console.error('Error moving files:', error);
      throw error;
    }
  },

  async deleteFiles(path: string): Promise<void> {
    try {
      const folderRef = ref(storage, path);
      const listResult = await listAll(folderRef);

      // Delete each file in the folder
      await Promise.all(
        listResult.items.map(itemRef => deleteObject(itemRef))
      );
    } catch (error) {
      console.error('Error deleting files:', error);
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    try {
      console.log('Deleting file:', path);
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
};
