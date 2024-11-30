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
      // Force refresh the token to ensure it's valid
      await auth.currentUser.reload();
      const idToken = await auth.currentUser.getIdToken(true);
      
      console.log('Token details:', {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        hasToken: !!idToken,
        tokenLength: idToken?.length,
        emailVerified: auth.currentUser.emailVerified,
        lastLoginTime: auth.currentUser.metadata.lastSignInTime,
        creationTime: auth.currentUser.metadata.creationTime
      });

      const response = await fetch('/.netlify/functions/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ facilityId })
      });

      // Log response details
      console.log('Checkout response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Checkout error response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });

        // Handle specific error cases
        if (response.status === 401) {
          // Force a new sign in if authentication failed
          await auth.signOut();
          throw new Error('Authentication expired. Please sign in again.');
        }

        throw new Error(data.message || data.error || `Failed to create checkout session (${response.status})`);
      }

      // Validate the response data
      if (!data.sessionId) {
        console.error('Invalid response data:', data);
        throw new Error('Invalid response: missing session ID');
      }

      return data as CheckoutResponse;
    } catch (error) {
      // Log the full error for debugging
      console.error('Payment service error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any).code,
        name: error instanceof Error ? error.name : undefined,
        stack: error instanceof Error ? error.stack : undefined,
        user: auth.currentUser ? {
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          emailVerified: auth.currentUser.emailVerified
        } : 'No user'
      });

      // Handle Firebase Auth errors
      if ((error as any).code?.startsWith('auth/')) {
        await auth.signOut();
        throw new Error('Authentication error. Please sign in again.');
      }

      // If it's already an Error object, rethrow it
      if (error instanceof Error) {
        throw error;
      }

      // Otherwise, wrap it in an Error object with a generic message
      throw new Error('Failed to create checkout session. Please try again.');
    }
  }
};
