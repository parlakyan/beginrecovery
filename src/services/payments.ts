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
      // Log user state before token refresh
      console.log('User state before token refresh:', {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        lastLoginTime: auth.currentUser.metadata.lastSignInTime,
        creationTime: auth.currentUser.metadata.creationTime
      });

      // Force reload user before getting token
      await auth.currentUser.reload();
      console.log('User reloaded successfully');

      // Get fresh auth token with force refresh
      const idToken = await auth.currentUser.getIdToken(true);
      console.log('Got fresh ID token:', { 
        hasToken: !!idToken,
        tokenLength: idToken?.length,
        userId: auth.currentUser.uid,
        timestamp: new Date().toISOString()
      });

      // Create checkout session via API
      console.log('Creating checkout session for facility:', { facilityId });
      const response = await fetch('/.netlify/functions/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ facilityId })
      });

      // Log response status
      console.log('Checkout API response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      const data = await response.json();

      // Handle API errors
      if (!response.ok) {
        console.error('Checkout error response:', {
          status: response.status,
          statusText: response.statusText,
          data,
          timestamp: new Date().toISOString()
        });

        // Handle specific error cases
        if (response.status === 401) {
          if (data.error === 'Token expired') {
            throw new Error('Authentication expired. Please sign in again.');
          }
          if (data.error === 'Invalid token') {
            // Force token refresh and retry once
            console.log('Invalid token detected, attempting refresh...');
            await auth.currentUser.reload();
            const newToken = await auth.currentUser.getIdToken(true);
            
            // Retry with new token
            const retryResponse = await fetch('/.netlify/functions/api/create-checkout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${newToken}`
              },
              body: JSON.stringify({ facilityId })
            });

            if (!retryResponse.ok) {
              throw new Error('Authentication failed. Please sign in again.');
            }

            const retryData = await retryResponse.json();
            return retryData as CheckoutResponse;
          }
        }

        throw new Error(data.message || data.error || `Failed to create checkout session (${response.status})`);
      }

      // Validate response data
      if (!data.sessionId) {
        console.error('Invalid API response:', data);
        throw new Error('Invalid response: missing session ID');
      }

      // Log successful response
      console.log('Checkout session created successfully:', {
        hasSessionId: !!data.sessionId,
        hasUrl: !!data.url,
        timestamp: new Date().toISOString()
      });

      return data as CheckoutResponse;
    } catch (error) {
      // Log detailed error for debugging
      console.error('Payment service error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code,
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
        userId: auth.currentUser?.uid,
        userEmail: auth.currentUser?.email
      });

      // Handle Firebase Auth specific errors
      if ((error as any).code?.startsWith('auth/')) {
        throw new Error('Authentication error. Please sign in again.');
      }

      // If it's already an Error object, rethrow it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, wrap it in an Error object
      throw new Error('Failed to create checkout session. Please try again.');
    }
  }
};
