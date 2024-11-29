import * as admin from 'firebase-admin';

// Format private key correctly
const formatPrivateKey = (key: string) => {
  // Remove any extra quotes that might be present
  const cleanKey = key.replace(/"/g, '');
  // Ensure proper newline characters
  return cleanKey.replace(/\\n/g, '\n');
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY || '')
      })
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
    throw error;
  }
}

export const db = admin.firestore();
export const auth = admin.auth();
