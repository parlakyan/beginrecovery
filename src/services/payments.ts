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
        // Log the error details for debugging
        console.error('Checkout error response:', data);
        
        // Throw a user-friendly error message
        throw new Error(
          data.message || 
          data.error || 
          `Failed to create checkout session (${response.status})`
        );
      }

      // Validate the response data
      if (!data.sessionId) {
        throw new Error('Invalid response: missing session ID');
      }

      return data as CheckoutResponse;
    } catch (error) {
      // Log the full error for debugging
      console.error('Payment service error:', error);

      // If it's already an Error object, rethrow it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, wrap it in an Error object with a generic message
      throw new Error('Failed to create checkout session. Please try again.');
    }
  },

  // Helper method to validate the response
  validateCheckoutResponse(data: any): data is CheckoutResponse {
    return (
      typeof data === 'object' &&
      data !== null &&
      typeof data.sessionId === 'string' &&
      (data.url === undefined || typeof data.url === 'string')
    );
  }
};
