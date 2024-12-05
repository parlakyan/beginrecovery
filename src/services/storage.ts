import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageError
} from 'firebase/storage';
import { storage } from '../lib/firebase';

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  error: string;
  code?: string;
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
    console.log('Starting image upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      path,
      timestamp: new Date().toISOString()
    });

    const error = this.validateFile(file);
    if (error) {
      console.log('File validation failed:', error);
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
            console.log('Upload progress:', {
              path,
              progress: Math.round(progress),
              transferred: snapshot.bytesTransferred,
              total: snapshot.totalBytes
            });
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error: StorageError) => {
            console.error('Upload error:', {
              code: error.code,
              message: error.message,
              name: error.name,
              path,
              timestamp: new Date().toISOString()
            });
            reject({ 
              error: this.getErrorMessage(error),
              code: error.code
            });
          },
          async () => {
            try {
              const url = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Upload completed successfully:', {
                path,
                url: url.split('?')[0], // Log URL without query params
                timestamp: new Date().toISOString()
              });
              resolve({ url, path });
            } catch (error) {
              console.error('Error getting download URL:', {
                error,
                path,
                timestamp: new Date().toISOString()
              });
              reject({ 
                error: 'Failed to get download URL',
                code: (error as StorageError)?.code
              });
            }
          }
        );
      });
    } catch (error) {
      console.error('Error starting upload:', {
        error,
        path,
        timestamp: new Date().toISOString()
      });
      return { 
        error: 'Failed to start upload',
        code: (error as StorageError)?.code
      };
    }
  },

  async uploadImages(
    files: File[], 
    path: string,
    onProgress?: (progress: number) => void
  ): Promise<(UploadResult | UploadError)[]> {
    console.log('Starting batch image upload:', {
      fileCount: files.length,
      path,
      timestamp: new Date().toISOString()
    });

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
    console.log('Moving files:', {
      fromPath,
      toPath,
      timestamp: new Date().toISOString()
    });

    try {
      const fromRef = ref(storage, fromPath);
      const listResult = await listAll(fromRef);

      console.log('Files to move:', {
        count: listResult.items.length,
        fromPath,
        toPath
      });

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

        console.log('File moved successfully:', {
          from: itemRef.fullPath,
          to: newPath
        });
      }));
    } catch (error) {
      console.error('Error moving files:', {
        error,
        fromPath,
        toPath,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async deleteFiles(path: string): Promise<void> {
    console.log('Deleting files in path:', {
      path,
      timestamp: new Date().toISOString()
    });

    try {
      const folderRef = ref(storage, path);
      const listResult = await listAll(folderRef);

      console.log('Files to delete:', {
        count: listResult.items.length,
        path
      });

      // Delete each file in the folder
      await Promise.all(
        listResult.items.map(async (itemRef) => {
          await deleteObject(itemRef);
          console.log('File deleted:', itemRef.fullPath);
        })
      );
    } catch (error) {
      console.error('Error deleting files:', {
        error,
        path,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    console.log('Deleting file:', {
      path,
      timestamp: new Date().toISOString()
    });

    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      console.log('File deleted successfully:', path);
    } catch (error) {
      console.error('Error deleting file:', {
        error,
        path,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  getErrorMessage(error: StorageError): string {
    switch (error.code) {
      case 'storage/unauthorized':
        return 'You do not have permission to perform this action';
      case 'storage/canceled':
        return 'Upload was canceled';
      case 'storage/unknown':
        return 'An unknown error occurred';
      case 'storage/object-not-found':
        return 'File not found';
      case 'storage/quota-exceeded':
        return 'Storage quota exceeded';
      case 'storage/invalid-checksum':
        return 'File is corrupted';
      case 'storage/retry-limit-exceeded':
        return 'Upload failed too many times';
      default:
        return 'An error occurred during the operation';
    }
  }
};
