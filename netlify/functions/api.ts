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

    // Stripe webhook endpoint
    if (path === 'webhook' && event.httpMethod === 'POST') {
      const sig = event.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!webhookSecret) {
        throw new Error('Missing STRIPE_WEBHOOK_SECRET');
      }

      if (!sig) {
        throw new Error('Missing stripe-signature header');
      }

      if (!event.body) {
        throw new Error('Missing request body');
      }

      try {
        const stripeEvent = stripe.webhooks.constructEvent(
          event.body,
          sig,
          webhookSecret
        );

        switch (stripeEvent.type) {
          case 'checkout.session.completed': {
            const session = stripeEvent.data.object;
            const facilityId = session.metadata?.facilityId;
            
            if (!facilityId) {
              throw new Error('Missing facilityId in session metadata');
            }

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
            const facilitiesRef = db.collection('facilities');
            const snapshot = await facilitiesRef
              .where('subscriptionId', '==', subscription.id)
              .get();

            if (!snapshot.empty) {
              await snapshot.docs[0].ref.update({
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
          body: JSON.stringify({ error: `Webhook Error: ${(err as Error).message}` })
        };
      }
    }

    // Create checkout session endpoint
    if (path === 'create-checkout' && event.httpMethod === 'POST') {
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
      const decodedToken = await auth.verifyIdToken(token);

      // Parse request body
      if (!event.body) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing request body' })
        };
      }

      const { facilityId } = JSON.parse(event.body);
      
      if (!facilityId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing facilityId' })
        };
      }

      // Get facility data
      const facilityDoc = await db.collection('facilities').doc(facilityId).get();
      if (!facilityDoc.exists) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Facility not found' })
        };
      }

      const facilityData = facilityDoc.data();

      // Create Stripe checkout session
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

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          sessionId: session.id,
          url: session.url 
        })
      };
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
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      })
    };
  }
};
