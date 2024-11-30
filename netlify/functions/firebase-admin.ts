import * as admin from 'firebase-admin';

/**
 * Firebase Admin Initialization
 * 
 * Environment Variables Required:
 * - FIREBASE_PRIVATE_KEY: Service account private key (from JSON)
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - VITE_FIREBASE_PROJECT_ID: Firebase project ID
 * 
 * Note: Private key must be provided exactly as it appears in the JSON file,
 * including quotes and \n characters
 */

const initializeFirebaseAdmin = () => {
  // Return existing instance if already initialized
  if (admin.apps.length) {
    return admin.apps[0];
  }

  try {
    // Log initialization attempt (without sensitive data)
    console.log('Initializing Firebase Admin with:', {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
    });

    // Get and validate private key
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('Private key is required but was not provided');
    }

    // Format the private key - handle \n and quotes from JSON
    const formattedKey = privateKey
      .replace(/\\n/g, '\n')
      .replace(/^"/, '')
      .replace(/"$/, '');

    // Log key format for debugging
    console.log('Private key format:', {
      startsWithBegin: formattedKey.startsWith('-----BEGIN PRIVATE KEY-----'),
      endsWithEnd: formattedKey.endsWith('-----END PRIVATE KEY-----'),
      length: formattedKey.length,
      containsNewlines: formattedKey.includes('\n')
    });

    // Initialize the app with service account
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
        privateKey: formattedKey
      })
    });

    console.log('Firebase Admin initialized successfully');
    return app;
  } catch (error) {
    // Log detailed error for debugging
    console.error('Firebase Admin initialization error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : undefined,
      code: (error as any).code,
      details: (error as any).details,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

// Initialize Firebase Admin
const app = initializeFirebaseAdmin();

// Export initialized services
export const db = admin.firestore();
export const auth = admin.auth();
