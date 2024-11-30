import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { db, auth } from './firebase-admin';

/**
 * API Handler for BeginRecovery payment system
 * 
 * Environment Variables Required:
 * - STRIPE_SECRET_KEY: Stripe API secret key
 * - STRIPE_PRICE_ID: Subscription price ID
 * - SITE_URL: Base URL for redirects
 * - STRIPE_WEBHOOK_SECRET: Webhook signing secret
 * 
 * Endpoints:
 * - POST /create-checkout: Create Stripe checkout session
 * - POST /webhook: Handle Stripe webhook events
 * - GET /user: Get user data and role
 */

// Validate required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.STRIPE_PRICE_ID) {
  throw new Error('Missing STRIPE_PRICE_ID environment variable');
}

if (!process.env.SITE_URL) {
  throw new Error('Missing SITE_URL environment variable');
}

if (!process.env.STRIPE_WEBHOOK_SECRET) {
  throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
}

// Initialize Stripe with API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export const handler: Handler = async (event, context) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
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
    console.log('Processing request:', { 
      path, 
      method: event.httpMethod,
      hasAuth: !!event.headers.authorization,
      authHeader: event.headers.authorization?.substring(0, 20) + '...'
    });

    /**
     * User Data Endpoint
     * Handles user data retrieval and role verification
     */
    if (path === 'user' && event.httpMethod === 'GET') {
      const authHeader = event.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Unauthorized' })
        };
      }

      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        
        // Get user data from Firestore
        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
        const userData = userDoc.data();

        console.log('User data retrieved:', {
          email: decodedToken.email,
          hasUserDoc: userDoc.exists,
          storedRole: userData?.role
        });

        // Check for admin status
        const isAdmin = decodedToken.email === 'admin@beginrecovery.com' || userData?.role === 'admin';

        // If user document doesn't exist, create it
        if (!userDoc.exists) {
          const newUserData = {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };

          await db.collection('users').doc(decodedToken.uid).set(newUserData);
          console.log('Created new user document with role:', newUserData.role);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(newUserData)
          };
        }

        // Return existing user data with admin check
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            id: decodedToken.uid,
            email: decodedToken.email,
            role: isAdmin ? 'admin' : (userData?.role || 'user'),
            createdAt: userData?.createdAt || new Date().toISOString()
          })
        };
      } catch (error) {
        console.error('Error getting user data:', error);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Invalid token' })
        };
      }
    }

    /**
     * Webhook Handler
     * Handles Stripe webhook events
     */
    if (path === 'webhook' && event.httpMethod === 'POST') {
      const sig = event.headers['stripe-signature'];
      
      if (!sig) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing stripe-signature header' })
        };
      }

      try {
        const stripeEvent = stripe.webhooks.constructEvent(
          event.body || '',
          sig,
          process.env.STRIPE_WEBHOOK_SECRET || ''
        );

        console.log('Processing webhook event:', {
          type: stripeEvent.type,
          id: stripeEvent.id
        });

        switch (stripeEvent.type) {
          case 'checkout.session.completed': {
            const session = stripeEvent.data.object;
            const facilityId = session.metadata?.facilityId;
            const userId = session.metadata?.userId;
            
            if (!facilityId) {
              throw new Error('Missing facilityId in session metadata');
            }

            console.log('Processing successful checkout:', {
              facilityId,
              userId,
              subscriptionId: session.subscription
            });

            await db.collection('facilities')
              .doc(facilityId)
              .update({
                status: 'active',
                subscriptionId: session.subscription,
                updatedAt: new Date().toISOString()
              });

            break;
          }

          case 'customer.subscription.deleted': {
            const subscription = stripeEvent.data.object;
            console.log('Processing subscription deletion:', {
              subscriptionId: subscription.id
            });

            const facilitiesRef = db.collection('facilities');
            const snapshot = await facilitiesRef
              .where('subscriptionId', '==', subscription.id)
              .get();

            if (!snapshot.empty) {
              const doc = snapshot.docs[0];
              console.log('Deactivating facility:', { facilityId: doc.id });
              
              await doc.ref.update({
                status: 'inactive',
                updatedAt: new Date().toISOString()
              });
            }
            break;
          }
        }

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ received: true })
        };
      } catch (err) {
        console.error('Webhook error:', err);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ 
            error: 'Webhook Error',
            message: err instanceof Error ? err.message : 'Unknown webhook error'
          })
        };
      }
    }

    /**
     * Checkout Session Creator
     * Creates Stripe checkout session
     */
    if (path === 'create-checkout' && event.httpMethod === 'POST') {
      console.log('Processing checkout request');
      
      const authHeader = event.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        console.error('Missing or invalid authorization header');
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Unauthorized',
            message: 'Missing or invalid authorization header'
          })
        };
      }

      const token = authHeader.split('Bearer ')[1];
      console.log('Attempting to verify Firebase token');
      
      try {
        const decodedToken = await auth.verifyIdToken(token, true);
        console.log('Token verified successfully:', { 
          uid: decodedToken.uid,
          email: decodedToken.email,
          hasEmail: !!decodedToken.email
        });

        if (!event.body) {
          throw new Error('Missing request body');
        }

        const { facilityId } = JSON.parse(event.body);
        console.log('Processing facility:', { facilityId });
        
        if (!facilityId) {
          throw new Error('Missing facilityId');
        }

        const facilityDoc = await db.collection('facilities').doc(facilityId).get();
        if (!facilityDoc.exists) {
          throw new Error('Facility not found');
        }

        const facilityData = facilityDoc.data();
        console.log('Facility data retrieved:', { 
          name: facilityData?.name,
          hasData: !!facilityData 
        });

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          line_items: [{
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          }],
          success_url: `${process.env.SITE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.SITE_URL}/payment/cancel`,
          customer_email: decodedToken.email || undefined,
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
      } catch (authError) {
        console.error('Authentication error:', {
          message: authError instanceof Error ? authError.message : 'Unknown error',
          code: (authError as any).code,
          name: authError instanceof Error ? authError.name : undefined
        });

        const errorCode = (authError as any).code;
        if (errorCode === 'auth/id-token-expired') {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
              error: 'Token expired',
              message: 'Please log in again'
            })
          };
        }

        if (errorCode === 'auth/invalid-id-token') {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ 
              error: 'Invalid token',
              message: 'Authentication failed. Please try again.'
            })
          };
        }

        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Authentication failed',
            message: authError instanceof Error ? authError.message : 'Unknown authentication error'
          })
        };
      }
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Not found' })
    };
  } catch (error) {
    console.error('API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as any).code,
      name: error instanceof Error ? error.name : undefined,
      stack: error instanceof Error ? error.stack : undefined
    });

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      })
    };
  }
};
