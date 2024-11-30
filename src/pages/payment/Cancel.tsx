import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <XCircle className="w-16 h-16 text-red-500" />
              <h1 className="text-2xl font-bold">Payment Cancelled</h1>
              <p className="text-gray-600">
                Your payment was cancelled and you have not been charged.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/payment')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Return Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
