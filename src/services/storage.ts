import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageError,
  StorageReference,
  UploadTaskSnapshot
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

export interface MovedFile {
  oldUrl: string;
  newUrl: string;
  oldPath: string;
  newPath: string;
}

export interface MoveFilesResult {
  movedFiles: MovedFile[];
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
      // Only clean up logo folder if we're uploading to a logo folder
      if (path.includes('/logo/')) {
        const folderPath = path.split('/').slice(0, -1).join('/');
        await this.cleanupFolder(folderPath);
      }

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
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

  async cleanupFolder(path: string): Promise<void> {
    try {
      console.log('Cleaning up folder:', path);
      const folderRef = ref(storage, path);
      const listResult = await listAll(folderRef);

      // Delete each file in the folder
      await Promise.all(
        listResult.items.map(async (itemRef) => {
          try {
            await deleteObject(itemRef);
            console.log('Deleted file:', itemRef.fullPath);
          } catch (error) {
            if ((error as StorageError).code === 'storage/object-not-found') {
              // Ignore if file doesn't exist
              console.log('File already deleted:', itemRef.fullPath);
            } else {
              console.error('Error deleting file:', {
                path: itemRef.fullPath,
                error,
                timestamp: new Date().toISOString()
              });
            }
          }
        })
      );
    } catch (error) {
      if ((error as StorageError).code === 'storage/object-not-found') {
        // Ignore if folder doesn't exist
        console.log('Folder does not exist:', path);
        return;
      }
      console.error('Error cleaning up folder:', {
        path,
        error,
        timestamp: new Date().toISOString()
      });
    }
  },

  async moveFiles(fromPath: string, toPath: string): Promise<MoveFilesResult> {
    console.log('Moving files:', {
      fromPath,
      toPath,
      timestamp: new Date().toISOString()
    });

    try {
      const fromRef = ref(storage, fromPath);
      const listResult = await listAll(fromRef);
      const movedFiles: MovedFile[] = [];

      // Move each file
      await Promise.all(
        listResult.items.map(async (itemRef) => {
          try {
            // Get the file data
            const url = await getDownloadURL(itemRef);
            const response = await fetch(url);
            const blob = await response.blob();

            // Create new path
            const fileName = itemRef.name;
            const newPath = `${toPath}/${fileName}`;
            const newRef = ref(storage, newPath);

            // Upload to new location
            const uploadTask = uploadBytesResumable(newRef, blob);
            await new Promise<void>((resolve, reject) => {
              uploadTask.on(
                'state_changed',
                (snapshot: UploadTaskSnapshot) => {
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  console.log('Move progress:', {
                    file: fileName,
                    progress: Math.round(progress)
                  });
                },
                (error: StorageError) => reject(error),
                () => resolve()
              );
            });

            // Get new URL
            const newUrl = await getDownloadURL(newRef);

            // Delete original
            await deleteObject(itemRef);

            movedFiles.push({
              oldUrl: url,
              newUrl,
              oldPath: itemRef.fullPath,
              newPath: newRef.fullPath
            });

            console.log('File moved successfully:', {
              from: itemRef.fullPath,
              to: newRef.fullPath
            });
          } catch (error) {
            console.error('Error moving file:', {
              file: itemRef.fullPath,
              error
            });
          }
        })
      );

      console.log('Files moved successfully:', {
        count: movedFiles.length,
        files: movedFiles.map(f => ({ from: f.oldPath, to: f.newPath }))
      });

      return { movedFiles };
    } catch (error) {
      if ((error as StorageError).code === 'storage/object-not-found') {
        // Return empty result if source folder doesn't exist
        console.log('Source folder does not exist:', fromPath);
        return { movedFiles: [] };
      }
      console.error('Error moving files:', {
        fromPath,
        toPath,
        error,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async deleteFile(path: string): Promise<void> {
    try {
      console.log('Deleting file:', {
        path,
        timestamp: new Date().toISOString()
      });

      // If deleting from a logo folder, clean up the entire folder
      if (path.includes('/logo/')) {
        const folderPath = path.split('/').slice(0, -1).join('/');
        await this.cleanupFolder(folderPath);
      } else {
        const fileRef = ref(storage, path);
        await deleteObject(fileRef);
        console.log('File deleted successfully:', path);
      }
    } catch (error) {
      if ((error as StorageError).code === 'storage/object-not-found') {
        // Ignore if file doesn't exist
        console.log('File already deleted:', path);
        return;
      }
      console.error('Error deleting file:', {
        error,
        path,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  async deleteFiles(paths: string[]): Promise<void> {
    try {
      console.log('Deleting multiple files:', {
        count: paths.length,
        paths,
        timestamp: new Date().toISOString()
      });

      await Promise.all(
        paths.map(async (path) => {
          try {
            await this.deleteFile(path);
          } catch (error) {
            if ((error as StorageError).code === 'storage/object-not-found') {
              // Ignore if file doesn't exist
              console.log('File already deleted:', path);
            } else {
              console.error('Error deleting file:', {
                path,
                error,
                timestamp: new Date().toISOString()
              });
            }
          }
        })
      );
    } catch (error) {
      console.error('Error in batch file deletion:', error);
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
