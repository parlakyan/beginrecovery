import * as admin from 'firebase-admin';

/**
 * Firebase Admin Initialization
 * 
 * Environment Variables Required:
 * - FIREBASE_SERVICE_ACCOUNT: The entire service account JSON as a string
 */

interface ServiceAccount {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

const initializeFirebaseAdmin = () => {
  // Return existing instance if already initialized
  if (admin.apps.length) {
    console.log('Firebase Admin: Using existing instance');
    return admin.apps[0];
  }

  try {
    console.log('Firebase Admin: Starting initialization');

    // Parse service account JSON
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is required');
    }

    let serviceAccount: ServiceAccount;
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      console.log('Firebase Admin: Service account parsed successfully', {
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        hasPrivateKey: !!serviceAccount.private_key,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Firebase Admin: Failed to parse service account JSON:', error);
      throw new Error('Invalid service account JSON format');
    }

    // Initialize app with service account
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
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
