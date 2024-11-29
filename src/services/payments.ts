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
      // Get a fresh token
      const idToken = await auth.currentUser.getIdToken(true);
      console.log('Got fresh ID token:', { 
        hasToken: !!idToken,
        tokenLength: idToken?.length,
        userId: auth.currentUser.uid
      });

      const response = await fetch('/.netlify/functions/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ facilityId })
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Checkout error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || data.error || `Failed to create checkout session (${response.status})`);
      }

      // Validate the response data
      if (!data.sessionId) {
        throw new Error('Invalid response: missing session ID');
      }

      return data as CheckoutResponse;
    } catch (error) {
      // Log the full error for debugging
      console.error('Payment service error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code,
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });

      // If it's already an Error object, rethrow it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, wrap it in an Error object with a generic message
      throw new Error('Failed to create checkout session. Please try again.');
    }
  }
};
