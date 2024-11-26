import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

export const createSubscriptionSession = async ({ facilityId, customerId }) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.VITE_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.VITE_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL}/payment/cancel`,
      metadata: {
        facilityId,
      },
      customer: customerId,
    });

    return session;
  } catch (error) {
    console.error('Error creating subscription session:', error);
    throw error;
  }
};

export const handleWebhookEvent = async (event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      // Update facility status to active
      await updateFacilityStatus(session.metadata.facilityId, 'active');
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      // Update facility status to inactive
      await updateFacilityStatus(subscription.metadata.facilityId, 'inactive');
      break;
  }
};