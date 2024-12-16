import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { paymentsService } from '../services/payments';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Lazy load Stripe only when needed
const loadStripeInstance = async () => {
  const { loadStripe } = await import('@stripe/stripe-js');
  return loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
};

interface StoredData {
  facilityId: string;
  facility: Facility;
}

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshToken } = useAuthStore();
  
  // Try to get data from location state or sessionStorage
  const storedData = location.state as StoredData || JSON.parse(sessionStorage.getItem('facilityData') || '{}') as StoredData;
  const facilityId = storedData.facilityId;
  const facilityData = storedData.facility;

  // Store facility data in sessionStorage when available
  useEffect(() => {
    if (facilityId && facilityData) {
      sessionStorage.setItem('facilityData', JSON.stringify({
        facilityId,
        facility: facilityData
      }));
    }
  }, [facilityId, facilityData]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Ensure we have the required data
  useEffect(() => {
    if (!facilityId || !facilityData) {
      navigate('/create-listing');
    }
  }, [facilityId, facilityData, navigate]);

  // Ensure user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        // Store the current path and data for redirect after login
        sessionStorage.setItem('paymentData', JSON.stringify({
          facilityId,
          facilityData
        }));
        navigate('/login', { 
          state: { 
            returnUrl: '/payment', 
            facilityId, 
            facilityData 
          }
        });
      } else {
        try {
          // Refresh token to ensure it's valid
          await refreshToken();
        } catch (err) {
          console.error('Error refreshing token:', err);
          setError('Authentication expired. Please log in again.');
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                returnUrl: '/payment',
                facilityId,
                facilityData
              }
            });
          }, 2000);
        }
      }
    };

    checkAuth();
  }, [user, navigate, facilityId, facilityData, refreshToken]);

  const handleSkip = async () => {
    setLoading(true);
    setError(null);

    try {
      // Update facility with status
      await facilitiesService.updateFacility(facilityId, {
        isVerified: false,
        moderationStatus: 'pending',
        // Only include logo if it exists
        ...(facilityData.logo ? { logo: facilityData.logo } : {})
      });

      // Get updated facility data
      const updatedFacility = await facilitiesService.getFacilityById(facilityId);
      if (!updatedFacility) {
        throw new Error('Failed to get updated facility data');
      }

      // Clear stored data
      sessionStorage.removeItem('facilityData');
      sessionStorage.removeItem('paymentData');

      // Navigate to listing detail page using slug
      navigate(`/${updatedFacility.slug}`, { replace: true });
    } catch (err) {
      console.error('Error skipping payment:', err);
      setError('Failed to skip payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Verify we have required data
      if (!facilityId) {
        throw new Error('Missing facility information. Please try creating your listing again.');
      }

      if (!user) {
        throw new Error('Please log in to continue.');
      }

      // Refresh token before creating checkout session
      await refreshToken();

      // Create subscription checkout session
      console.log('Creating checkout session for facility:', { facilityId });
      const { sessionId, url } = await paymentsService.createSubscription({
        facilityId
      });

      // If we have a URL, use it directly (preferred method)
      if (url) {
        console.log('Redirecting to checkout URL');
        // Store payment data in sessionStorage for recovery
        sessionStorage.setItem('paymentData', JSON.stringify({
          facilityId,
          facilityData
        }));
        window.location.href = url;
        return;
      }

      // Fallback to redirectToCheckout if no URL is provided
      console.log('Using fallback redirect method');
      const stripe = await loadStripeInstance();
      if (!stripe) {
        throw new Error('Payment system is not available. Please try again later.');
      }

      if (!sessionId) {
        throw new Error('Unable to initialize payment. Please try again.');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId
      });

      if (stripeError) {
        console.error('Stripe redirect error:', stripeError);
        throw new Error(stripeError.message || 'Failed to redirect to payment page.');
      }
    } catch (err) {
      console.error('Payment error:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        code: (err as any).code,
        name: err instanceof Error ? err.name : undefined
      });
      
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('Authentication') || err.message.includes('log in')) {
          setError('Please log in again to continue.');
          // Store payment data before redirecting
          sessionStorage.setItem('paymentData', JSON.stringify({
            facilityId,
            facilityData
          }));
          // Redirect to login after a short delay
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                returnUrl: '/payment',
                facilityId,
                facilityData
              }
            });
          }, 2000);
          return;
        }
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show nothing while redirecting to login
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          {/* Add data-lpignore to prevent LastPass from injecting UI */}
          <div className="bg-white rounded-xl shadow-lg p-8" data-lpignore="true">
            <div className="text-center mb-8">
              <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Complete Your Subscription</h1>
              {facilityData?.name && (
                <h2 className="text-lg text-gray-700 font-medium mb-2">
                  {facilityData.name}
                </h2>
              )}
              <p className="text-gray-600">
                Upgrade to a verified listing or continue with a free unverified listing
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Premium Listing</span>
                <span className="font-semibold">$99.99/month</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Auto-renews monthly</span>
                <span>Cancel anytime</span>
              </div>
            </div>

            {/* Add data-lpignore to prevent LastPass from injecting UI */}
            <div className="space-y-4" data-lpignore="true">
              <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Processing...' : 'Complete Payment'}
              </button>

              <button
                onClick={handleSkip}
                disabled={loading}
                className="w-full border border-gray-300 bg-white text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Processing...' : 'Continue with Free Listing'}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              <span>Secure payment powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
