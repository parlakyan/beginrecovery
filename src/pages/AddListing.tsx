import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, Trophy, ArrowRight, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import PricingCard from '../components/PricingCard';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AddListing() {
  const { user, loading } = useAuthStore();
  const navigate = useNavigate();

  // Redirect non-owners to registration
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/register', { state: { userType: 'owner' } });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">List Your Rehabilitation Center</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Join the leading directory of rehabilitation facilities and connect with people seeking recovery support
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl font-bold mb-8">Why List With Us?</h2>
            
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Reach More People</h3>
                  <p className="text-gray-600">Connect with individuals actively seeking rehabilitation services in your area</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Showcase Your Facility</h3>
                  <p className="text-gray-600">Display your amenities, programs, and success stories with our premium listing features</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Stand Out</h3>
                  <p className="text-gray-600">Premium listings appear at the top of search results with enhanced visibility</p>
                </div>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-2 text-blue-600 font-semibold">
              <span>View our success stories</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

          <div className="flex justify-center">
            <PricingCard />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}