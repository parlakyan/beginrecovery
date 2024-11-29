import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    // Log environment variables (excluding sensitive values)
    console.log('Firebase Admin initialization:', {
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
    });

    // The private key comes with quotes and \n characters from the JSON file
    // We need to parse it to get the actual string value
    const privateKey = JSON.parse(process.env.FIREBASE_PRIVATE_KEY || '""');

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Use the parsed private key
        privateKey: privateKey
      })
    });

    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : undefined,
      code: (error as any).code,
      details: (error as any).details
    });
    throw error;
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
