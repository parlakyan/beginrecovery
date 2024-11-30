import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { db, auth, testConnection } from './firebase-admin';

/**
 * Create Checkout Session Handler
 * 
 * Creates a Stripe checkout session for facility subscription
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Stripe API key
 * - STRIPE_PRICE_ID: Subscription price ID
 * - URL: Site base URL for redirects
 */

// Validate environment variables
const validateEnvironment = () => {
  const validation = {
    stripe: {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPriceId: !!process.env.STRIPE_PRICE_ID,
      secretKeyLength: process.env.STRIPE_SECRET_KEY?.length
    },
    url: {
      hasUrl: !!process.env.URL,
      url: process.env.URL
    }
  };

  console.log('Environment validation:', {
    ...validation,
    timestamp: new Date().toISOString()
  });

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  }
  if (!process.env.STRIPE_PRICE_ID) {
    throw new Error('Missing STRIPE_PRICE_ID environment variable');
  }
  if (!process.env.URL) {
    throw new Error('Missing URL environment variable');
  }

  return validation;
};

// Initialize Stripe after validation
validateEnvironment();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export const handler: Handler = async (event) => {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`[${requestId}] Starting checkout request`);

  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Test Firebase Admin connection
    console.log(`[${requestId}] Testing Firebase Admin connection`);
    const connectionTest = await testConnection();
    console.log(`[${requestId}] Connection test result:`, connectionTest);

    if (!connectionTest.success) {
      throw new Error(`Firebase Admin connection failed: ${connectionTest.error}`);
    }

    // Log request details
    console.log(`[${requestId}] Request details:`, {
      method: event.httpMethod,
      hasAuth: !!event.headers.authorization,
      hasBody: !!event.body,
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    });

    // Verify Firebase Auth token
    const authHeader = event.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify token with detailed error handling
    console.log(`[${requestId}] Verifying auth token`);
    let decodedToken;
    try {
      decodedToken = await auth.verifyIdToken(token);
      console.log(`[${requestId}] Token verified:`, {
        uid: decodedToken.uid,
        email: decodedToken.email,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(`[${requestId}] Token verification error:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code,
        timestamp: new Date().toISOString()
      });

      // Handle specific token errors
      if ((error as any).code === 'auth/id-token-expired') {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Token expired',
            message: 'Please sign in again',
            details: {
              code: (error as any).code,
              serverTime: Date.now()
            }
          })
        };
      }

      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ 
          error: 'Authentication failed',
          message: error instanceof Error ? error.message : 'Token verification failed',
          details: {
            code: (error as any).code,
            serverTime: Date.now()
          }
        })
      };
    }

    // Parse and validate request body
    if (!event.body) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing request body' })
      };
    }

    const { facilityId } = JSON.parse(event.body);
    console.log(`[${requestId}] Parsed request body:`, { facilityId });

    if (!facilityId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing facilityId' })
      };
    }

    // Verify facility exists
    console.log(`[${requestId}] Verifying facility:`, { facilityId });
    const facilityDoc = await db.collection('facilities').doc(facilityId).get();
    
    if (!facilityDoc.exists) {
      console.log(`[${requestId}] Facility not found:`, { facilityId });
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Facility not found' })
      };
    }

    const facilityData = facilityDoc.data();
    console.log(`[${requestId}] Facility verified:`, {
      facilityId,
      name: facilityData?.name,
      timestamp: new Date().toISOString()
    });

    // Create Stripe checkout session
    console.log(`[${requestId}] Creating Stripe checkout session`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: process.env.STRIPE_PRICE_ID!,
        quantity: 1,
      }],
      success_url: `${process.env.URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.URL}/payment/cancel`,
      customer_email: decodedToken.email,
      metadata: {
        facilityId,
        userId: decodedToken.uid,
        facilityName: facilityData?.name || '',
        requestId
      }
    });

    console.log(`[${requestId}] Checkout session created:`, {
      sessionId: session.id,
      hasUrl: !!session.url,
      timestamp: new Date().toISOString()
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
    // Log detailed error for debugging
    console.error(`[${requestId}] Checkout error:`, {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      serverTime: Date.now()
    });

    // Handle specific error types
    if (error instanceof Stripe.errors.StripeError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Payment processing error',
          message: error.message,
          details: {
            type: error.type,
            code: error.code,
            requestId
          }
        })
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
        details: {
          requestId,
          timestamp: new Date().toISOString()
        }
      })
    };
  }
};
