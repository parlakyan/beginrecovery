import { Handler } from '@netlify/functions';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
}

if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
}

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = getFirestore(app);
const auth = getAuth(app);
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
    console.log('API Request:', { path, method: event.httpMethod });

    // Stripe webhook endpoint
    if (path === 'webhook' && event.httpMethod === 'POST') {
      const sig = event.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        console.error('Missing STRIPE_WEBHOOK_SECRET');
        throw new Error('Missing STRIPE_WEBHOOK_SECRET');
      }

      if (!sig) {
        console.error('Missing Stripe signature');
        throw new Error('Missing Stripe signature');
      }

      try {
        console.log('Processing Stripe webhook');
        const stripeEvent = stripe.webhooks.constructEvent(
          event.body || '',
          sig,
          webhookSecret
        );
        console.log('Stripe event:', stripeEvent.type);

        switch (stripeEvent.type) {
          case 'checkout.session.completed': {
            const session = stripeEvent.data.object;
            console.log('Processing completed checkout:', session.id);
            if (session.metadata?.facilityId) {
              await db.collection('facilities')
                .doc(session.metadata.facilityId)
                .update({
                  status: 'active',
                  subscriptionId: session.subscription,
                  updatedAt: new Date()
                });
            }
            break;
          }

          case 'customer.subscription.deleted': {
            const subscription = stripeEvent.data.object;
            console.log('Processing subscription deletion:', subscription.id);
            const facilitiesRef = db.collection('facilities');
            const snapshot = await facilitiesRef
              .where('subscriptionId', '==', subscription.id)
              .get();

            if (!snapshot.empty) {
              await snapshot.docs[0].ref.update({
                status: 'inactive',
                updatedAt: new Date()
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
          body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
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
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    };
  }
};
