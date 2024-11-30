import * as admin from 'firebase-admin';

/**
 * Firebase Admin Initialization
 * 
 * Environment Variables Required:
 * - FIREBASE_PRIVATE_KEY: Service account private key (from JSON)
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - VITE_FIREBASE_PROJECT_ID: Firebase project ID
 */

const validateServiceAccount = () => {
  const validation = {
    hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
    hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
    hasProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
    timestamp: new Date().toISOString()
  };

  console.log('Firebase Admin: Environment validation:', validation);

  if (!process.env.FIREBASE_PRIVATE_KEY) {
    throw new Error('FIREBASE_PRIVATE_KEY is required');
  }
  if (!process.env.FIREBASE_CLIENT_EMAIL) {
    throw new Error('FIREBASE_CLIENT_EMAIL is required');
  }
  if (!process.env.VITE_FIREBASE_PROJECT_ID) {
    throw new Error('VITE_FIREBASE_PROJECT_ID is required');
  }

  return validation;
};

const formatPrivateKey = (rawKey: string): string => {
  let key = rawKey;
  
  // Remove quotes if present
  if (key.startsWith('"') && key.endsWith('"')) {
    key = key.slice(1, -1);
  }
  
  // Replace escaped newlines
  key = key.replace(/\\n/g, '\n');
  
  return key;
};

const initializeFirebaseAdmin = () => {
  // Return existing instance if already initialized
  if (admin.apps.length) {
    console.log('Firebase Admin: Using existing instance');
    return admin.apps[0];
  }

  try {
    // Validate environment variables
    validateServiceAccount();

    // Format private key
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY!);

    // Initialize app with service account
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: privateKey
      })
    });

    console.log('Firebase Admin: Initialized successfully');
    return app;
  } catch (error) {
    console.error('Firebase Admin: Initialization error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : undefined,
      code: (error as any).code,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Initialize Firebase Admin
console.log('Firebase Admin: Starting initialization');
const app = initializeFirebaseAdmin();

// Export initialized services
export const db = admin.firestore();
export const auth = admin.auth();

// Export test function that doesn't access Firestore
export const testConnection = async () => {
  try {
    // Only test auth service
    const token = await auth.createCustomToken('test-user');
    return {
      success: true,
      timestamp: new Date().toISOString(),
      tokenCreated: !!token
    };
  } catch (error) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code
    };
  }
};
