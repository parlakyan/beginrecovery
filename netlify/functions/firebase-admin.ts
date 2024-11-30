import * as admin from 'firebase-admin';

const initializeFirebaseAdmin = () => {
  if (admin.apps.length) {
    return admin.apps[0];
  }

  try {
    // Create a service account credential object
    const serviceAccount = {
      type: 'service_account',
      project_id: process.env.VITE_FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: '',
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
        process.env.FIREBASE_CLIENT_EMAIL || ''
      )}`
    };

    // Log initialization attempt (without sensitive data)
    console.log('Initializing Firebase Admin with:', {
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length
    });

    // Initialize the app with the service account
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });

    console.log('Firebase Admin initialized successfully');
    return app;
  } catch (error) {
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

// Export the initialized services
export const db = admin.firestore();
export const auth = admin.auth();
