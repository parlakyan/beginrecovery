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
  /**
   * Creates a Stripe subscription checkout session
   * 
   * @param {Object} params - Parameters for creating subscription
   * @param {string} params.facilityId - ID of the facility to subscribe
   * @returns {Promise<CheckoutResponse>} Checkout session details
   * 
   * Dependencies:
   * - Requires authenticated user (Firebase Auth)
   * - Requires valid facility ID in Firestore
   * - Requires Stripe configuration in backend
   * 
   * Environment Variables Required:
   * - STRIPE_PRICE_ID: Stripe subscription price ID
   * - SITE_URL: Base URL for success/cancel redirects
   */
  async createSubscription({ facilityId }: { facilityId: string }): Promise<CheckoutResponse> {
    // Verify user is authenticated
    if (!auth.currentUser) {
      throw new Error('User must be authenticated');
    }

    try {
      // Get fresh auth token to ensure it's valid
      const idToken = await auth.currentUser.getIdToken(true);
      console.log('Got fresh ID token:', { 
        hasToken: !!idToken,
        tokenLength: idToken?.length,
        userId: auth.currentUser.uid
      });

      // Create checkout session via API
      const response = await fetch('/.netlify/functions/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ facilityId })
      });

      const data = await response.json();

      // Handle API errors
      if (!response.ok) {
        console.error('Checkout error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(data.message || data.error || `Failed to create checkout session (${response.status})`);
      }

      // Validate response data
      if (!data.sessionId) {
        throw new Error('Invalid response: missing session ID');
      }

      return data as CheckoutResponse;
    } catch (error) {
      // Log detailed error for debugging
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

      // Otherwise, wrap it in an Error object
      throw new Error('Failed to create checkout session. Please try again.');
    }
  }
};
