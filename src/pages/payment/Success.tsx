import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PaymentSuccess() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();

  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        if (!sessionId) {
          throw new Error('No session ID found');
        }

        // Wait a moment for the webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Redirect to account page
        navigate('/account', { replace: true });
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError(err instanceof Error ? err.message : 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <h1 className="text-2xl font-bold">Processing Payment</h1>
                <p className="text-gray-600">
                  Please wait while we confirm your payment...
                </p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center gap-4">
                <div className="text-red-600 mb-4">{error}</div>
                <button
                  onClick={() => navigate('/account')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Go to Account
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <h1 className="text-2xl font-bold">Payment Successful!</h1>
                <p className="text-gray-600">
                  Your facility listing has been activated.
                </p>
                <button
                  onClick={() => navigate('/account')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  View Your Listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
