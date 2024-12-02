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
 */

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

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16'
});

export const handler: Handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const path = event.path.replace('/.netlify/functions/api/', '');
    console.log('Processing request:', { 
      path, 
      method: event.httpMethod,
      hasAuth: !!event.headers.authorization
    });

    // User Data Endpoint
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
        const userRef = db.collection('users').doc(decodedToken.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();

        console.log('User data retrieved:', {
          email: decodedToken.email,
          hasUserDoc: userDoc.exists,
          storedRole: userData?.role,
          docId: userDoc.id
        });

        // If user document doesn't exist, create it
        if (!userDoc.exists) {
          const isAdmin = decodedToken.email === 'admin@beginrecovery.com';
          const newUserData = {
            id: decodedToken.uid,
            email: decodedToken.email,
            role: isAdmin ? 'admin' : 'user',
            createdAt: new Date().toISOString()
          };

          await userRef.set(newUserData);
          console.log('Created new user document:', newUserData);

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(newUserData)
          };
        }

        // For existing users, check if they should be admin
        const isAdmin = decodedToken.email === 'admin@beginrecovery.com' || userData?.role === 'admin';
        
        // Update role if needed
        if (isAdmin && userData?.role !== 'admin') {
          await userRef.update({
            role: 'admin'
          });
          console.log('Updated user to admin role');
        }

        // Return user data with correct role
        const responseData = {
          id: decodedToken.uid,
          email: decodedToken.email,
          role: isAdmin ? 'admin' : (userData?.role || 'user'),
          createdAt: userData?.createdAt || new Date().toISOString()
        };

        console.log('Sending user data:', responseData);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(responseData)
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

    // Webhook Handler
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

        switch (stripeEvent.type) {
          case 'checkout.session.completed': {
            const session = stripeEvent.data.object;
            const facilityId = session.metadata?.facilityId;
            const userId = session.metadata?.userId;
            
            if (!facilityId || !userId) {
              throw new Error('Missing facilityId or userId in session metadata');
            }

            console.log('Processing successful payment:', {
              facilityId,
              userId,
              sessionId: session.id
            });

            // Update facility status and ensure ownerId is set
            await db.collection('facilities')
              .doc(facilityId)
              .update({
                status: 'active',
                isVerified: true, // Set verified status
                ownerId: userId,
                moderationStatus: 'pending',
                subscriptionId: session.subscription,
                updatedAt: new Date().toISOString()
              });

            // Update user role to owner
            await db.collection('users')
              .doc(userId)
              .update({
                role: 'owner',
                updatedAt: new Date().toISOString()
              });

            console.log('Updated facility and user:', {
              facilityId,
              userId,
              status: 'active',
              isVerified: true,
              moderationStatus: 'pending',
              subscriptionId: session.subscription
            });
            break;
          }

          case 'customer.subscription.deleted': {
            const subscription = stripeEvent.data.object;
            const facilitiesRef = db.collection('facilities');
            const snapshot = await facilitiesRef
              .where('subscriptionId', '==', subscription.id)
              .get();

            if (!snapshot.empty) {
              const doc = snapshot.docs[0];
              await doc.ref.update({
                status: 'inactive',
                isVerified: false, // Remove verified status
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

    // Checkout Handler
    if (path === 'create-checkout' && event.httpMethod === 'POST') {
      const authHeader = event.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
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
      
      try {
        const decodedToken = await auth.verifyIdToken(token, true);
        if (!event.body) {
          throw new Error('Missing request body');
        }

        const { facilityId } = JSON.parse(event.body);
        if (!facilityId) {
          throw new Error('Missing facilityId');
        }

        const facilityDoc = await db.collection('facilities').doc(facilityId).get();
        if (!facilityDoc.exists) {
          throw new Error('Facility not found');
        }

        const facilityData = facilityDoc.data();

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

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ 
            sessionId: session.id,
            url: session.url 
          })
        };
      } catch (authError) {
        console.error('Authentication error:', authError);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ 
            error: 'Authentication failed',
            message: authError instanceof Error ? authError.message : 'Unknown error'
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
    console.error('API error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
