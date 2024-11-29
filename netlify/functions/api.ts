import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { db, auth } from './firebase-admin';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.STRIPE_PRICE_ID) {
  throw new Error('Missing STRIPE_PRICE_ID environment variable');
}

if (!process.env.SITE_URL) {
  throw new Error('Missing SITE_URL environment variable');
}

// Log environment variables (excluding sensitive values)
console.log('Environment check:', {
  hasStripeKey: !!process.env.STRIPE_SECRET_KEY,
  hasPriceId: !!process.env.STRIPE_PRICE_ID,
  hasSiteUrl: !!process.env.SITE_URL,
  hasFirebasePrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
  hasFirebaseClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
  hasFirebaseProjectId: !!process.env.VITE_FIREBASE_PROJECT_ID,
  privateKeyLength: process.env.FIREBASE_PRIVATE_KEY?.length,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { 
      statusCode: 204, 
      headers 
    };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api/', '');
    console.log('Processing request:', { path, method: event.httpMethod });

    // Create checkout session endpoint
    if (path === 'create-checkout' && event.httpMethod === 'POST') {
      console.log('Processing checkout request');
      
      // Verify Firebase auth token
      const authHeader = event.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      const token = authHeader.split('Bearer ')[1];
      console.log('Verifying Firebase token');
      
      try {
        const decodedToken = await auth.verifyIdToken(token);
        console.log('Token verified successfully:', { uid: decodedToken.uid });

        // Parse request body
        if (!event.body) {
          throw new Error('Missing request body');
        }

        const { facilityId } = JSON.parse(event.body);
        console.log('Processing facility:', { facilityId });
        
        if (!facilityId) {
          throw new Error('Missing facilityId');
        }

        // Get facility data
        console.log('Fetching facility data');
        const facilityDoc = await db.collection('facilities').doc(facilityId).get();
        if (!facilityDoc.exists) {
          throw new Error('Facility not found');
        }

        const facilityData = facilityDoc.data();
        console.log('Facility data retrieved:', { 
          name: facilityData?.name,
          hasData: !!facilityData 
        });

        // Create Stripe checkout session
        console.log('Creating Stripe checkout session');
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          }],
          success_url: `${process.env.SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.SITE_URL}/payment/cancel`,
          customer_email: decodedToken.email,
          metadata: {
            facilityId,
            userId: decodedToken.uid,
            facilityName: facilityData?.name || ''
          }
        });

        console.log('Checkout session created:', { 
          sessionId: session.id,
          hasUrl: !!session.url 
        });

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            sessionId: session.id,
            url: session.url 
          })
        };
      } catch (error) {
        console.error('Error processing checkout:', error);
        throw error;
      }
    }

    // Handle other endpoints...
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('API error:', error);
    
    // Enhanced error logging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: (error as any).code,
      details: (error as any).details
    };
    
    console.error('Detailed error:', errorDetails);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: errorDetails
      })
    };
  }
};
