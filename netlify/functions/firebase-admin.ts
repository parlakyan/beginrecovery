import * as admin from 'firebase-admin';

/**
 * Firebase Admin Initialization
 * 
 * Environment Variables Required:
 * - FIREBASE_PRIVATE_KEY: Service account private key (from JSON)
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - VITE_FIREBASE_PROJECT_ID: Firebase project ID
 */

interface ServiceAccountValidation {
  hasPrivateKey: boolean;
  hasClientEmail: boolean;
  hasProjectId: boolean;
  privateKeyFormat: {
    length: number;
    startsWithBegin: boolean;
    endsWithEnd: boolean;
    containsNewlines: boolean;
    newlineCount: number;
    rawLength: number;
  };
  clientEmailFormat: {
    isValidEmail: boolean;
    domain: string;
  };
}

const validateServiceAccount = (): ServiceAccountValidation => {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

  // Log raw private key length and format for debugging
  console.log('Raw private key validation:', {
    length: privateKey?.length,
    firstChars: privateKey?.substring(0, 10),
    lastChars: privateKey?.substring(privateKey.length - 10),
    hasQuotes: privateKey?.startsWith('"') && privateKey?.endsWith('"'),
    hasEscapedNewlines: privateKey?.includes('\\n'),
    timestamp: new Date().toISOString()
  });

  // Format private key if it exists
  const formattedKey = privateKey
    ? privateKey
        .replace(/\\n/g, '\n')
        .replace(/^"/, '')
        .replace(/"$/, '')
        .trim()
    : '';

  return {
    hasPrivateKey: !!privateKey,
    hasClientEmail: !!clientEmail,
    hasProjectId: !!projectId,
    privateKeyFormat: {
      length: formattedKey.length,
      startsWithBegin: formattedKey.startsWith('-----BEGIN PRIVATE KEY-----'),
      endsWithEnd: formattedKey.endsWith('-----END PRIVATE KEY-----'),
      containsNewlines: formattedKey.includes('\n'),
      newlineCount: (formattedKey.match(/\n/g) || []).length,
      rawLength: privateKey?.length || 0
    },
    clientEmailFormat: {
      isValidEmail: clientEmail ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail) : false,
      domain: clientEmail ? clientEmail.split('@')[1] : ''
    }
  };
};

const formatPrivateKey = (rawKey: string): string => {
  // Remove quotes and trim
  let key = rawKey.replace(/^"|"$/g, '').trim();
  
  // Replace escaped newlines with actual newlines
  key = key.replace(/\\n/g, '\n');
  
  // Ensure key has proper header and footer
  if (!key.startsWith('-----BEGIN PRIVATE KEY-----')) {
    key = '-----BEGIN PRIVATE KEY-----\n' + key;
  }
  if (!key.endsWith('-----END PRIVATE KEY-----')) {
    key = key + '\n-----END PRIVATE KEY-----';
  }
  
  // Log formatted key details (without exposing the actual key)
  console.log('Formatted private key details:', {
    length: key.length,
    hasHeader: key.startsWith('-----BEGIN PRIVATE KEY-----'),
    hasFooter: key.endsWith('-----END PRIVATE KEY-----'),
    newlineCount: (key.match(/\n/g) || []).length,
    timestamp: new Date().toISOString()
  });
  
  return key;
};

const initializeFirebaseAdmin = () => {
  // Return existing instance if already initialized
  if (admin.apps.length) {
    console.log('Firebase Admin: Using existing instance');
    return admin.apps[0];
  }

  try {
    // Log environment validation
    const validation = validateServiceAccount();
    console.log('Firebase Admin: Environment validation:', {
      timestamp: new Date().toISOString(),
      hasRequiredVars: validation.hasPrivateKey && validation.hasClientEmail && validation.hasProjectId,
      privateKeyValid: validation.privateKeyFormat.startsWithBegin && validation.privateKeyFormat.endsWithEnd,
      clientEmailValid: validation.clientEmailFormat.isValidEmail,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID
    });

    // Validate required environment variables
    if (!process.env.FIREBASE_PRIVATE_KEY) {
      throw new Error('FIREBASE_PRIVATE_KEY is required');
    }
    if (!process.env.FIREBASE_CLIENT_EMAIL) {
      throw new Error('FIREBASE_CLIENT_EMAIL is required');
    }
    if (!process.env.VITE_FIREBASE_PROJECT_ID) {
      throw new Error('VITE_FIREBASE_PROJECT_ID is required');
    }

    // Format private key with proper handling
    const formattedKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    // Log initialization attempt
    console.log('Firebase Admin: Initializing with:', {
      timestamp: new Date().toISOString(),
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKeyLength: formattedKey.length,
      serverTime: new Date().toISOString(),
      serverTimestamp: Date.now()
    });

    // Initialize app with service account
    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formattedKey
      })
    });

    // Test the initialization
    return testInitialization(app);
  } catch (error) {
    console.error('Firebase Admin: Initialization error:', {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : undefined,
      code: (error as any).code,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw error;
  }
};

const testInitialization = async (app: admin.app.App) => {
  try {
    // Test Firestore connection
    const db = admin.firestore();
    await db.collection('_test').get();
    console.log('Firebase Admin: Firestore connection test successful');

    // Test Auth service
    const auth = admin.auth();
    const customToken = await auth.createCustomToken('test-user');
    console.log('Firebase Admin: Auth service test successful');

    console.log('Firebase Admin: All initialization tests passed');
    return app;
  } catch (error) {
    console.error('Firebase Admin: Initialization test failed:', {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code
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

// Export test function
export const testConnection = async () => {
  try {
    const token = await auth.createCustomToken('test-user');
    const validation = validateServiceAccount();
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      validation,
      tokenCreated: !!token,
      serverTime: Date.now()
    };
  } catch (error) {
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      serverTime: Date.now()
    };
  }
};
