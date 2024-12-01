import { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { db, auth } from './firebase-admin';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY environment variable');
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  try {
    const sig = event.headers['stripe-signature'];
    
    if (!sig) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing stripe-signature header' })
      };
    }

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

        // Update facility payment status only
        await db.collection('facilities')
          .doc(facilityId)
          .update({
            status: 'active',
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

        console.log('Updated user role to owner and activated facility:', {
          facilityId,
          userId,
          status: 'active',
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
            status: 'suspended',
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
};
