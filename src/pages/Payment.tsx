import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { useAuthStore } from '../store/authStore';
import { paymentsService } from '../services/payments';
import Header from '../components/Header';
import Footer from '../components/Footer';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export default function Payment() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const facilityId = location.state?.facilityId;
  const facilityData = location.state?.facility;

  React.useEffect(() => {
    if (!facilityId || !facilityData) {
      navigate('/create-listing');
    }
  }, [facilityId, facilityData, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // First check if Stripe is loaded
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Payment system is not available. Please try again later.');
      }

      // Validate required data
      if (!facilityId) {
        throw new Error('Missing facility information. Please try creating your listing again.');
      }

      // Create subscription checkout session
      const { sessionId, url } = await paymentsService.createSubscription({
        facilityId
      });

      // If we have a URL, use it directly (preferred method)
      if (url) {
        window.location.href = url;
        return;
      }

      // Fallback to redirectToCheckout if no URL is provided
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
      console.error('Payment error:', err);
      
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('Authentication')) {
          setError('Please log in again to continue.');
          // Optionally redirect to login
          navigate('/login', { 
            state: { 
              returnUrl: '/payment',
              facilityId,
              facilityData
            }
          });
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

  // Handle authentication
  if (!user) {
    navigate('/login', { 
      state: { 
        returnUrl: '/payment', 
        facilityId, 
        facilityData 
      } 
    });
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Complete Your Subscription</h1>
              <p className="text-gray-600">
                Your facility listing will be activated immediately after payment
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
                {error.includes('try again') && (
                  <button 
                    onClick={() => setError(null)}
                    className="ml-2 underline hover:no-underline"
                  >
                    Dismiss
                  </button>
                )}
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

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Processing...' : 'Complete Payment'}
            </button>

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
