import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe
export const stripe = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Create subscription checkout session
export const createSubscriptionSession = async (facilityId: string) => {
  try {
    const response = await fetch('/api/payments/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ facilityId }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};