import { auth } from '../lib/firebase';

interface CheckoutResponse {
  sessionId: string;
  url?: string;
}

interface ErrorResponse {
  error: string;
  message?: string;
}

export const paymentsService = {
  async createSubscription({ facilityId }: { facilityId: string }): Promise<CheckoutResponse> {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      const idToken = await auth.currentUser.getIdToken();
      const response = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ facilityId })
      });

      if (!response.ok) {
        const errorData = await response.json() as ErrorResponse;
        throw new Error(errorData.message || errorData.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return data as CheckoutResponse;
    } catch (error) {
      console.error('Payment error:', error);
      if (error instanceof Error) {
        throw new Error(`Payment error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred during payment');
    }
  }
};
