import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RehabCard from '../components/RehabCard';
import EditListingModal from '../components/EditListingModal';

export default function AccountPage() {
  const [listings, setListings] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          returnUrl: '/account'
        }
      });
    }
  }, [user, navigate]);

  // Fetch user's listings
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;

      try {
        const userListings = await facilitiesService.getUserListings(user.id);
        setListings(userListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  const handleSave = async (data: Partial<Facility>) => {
    if (!editingFacility) return;

    try {
      await facilitiesService.updateFacility(editingFacility.id, data);
      
      // Refresh listings
      if (user) {
        const updated = await facilitiesService.getUserListings(user.id);
        setListings(updated);
      }
      
      setEditingFacility(null);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">My Listings</h1>
            </div>
            <button
              onClick={() => navigate('/create-listing')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add New Listing
            </button>
          </div>

          {/* Listings Grid */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="flex items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-gray-600">Loading listings...</span>
              </div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">No Listings Yet</h2>
              <p className="text-gray-600 mb-6">Create your first listing to get started.</p>
              <button
                onClick={() => navigate('/create-listing')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(facility => (
                <RehabCard
                  key={facility.id}
                  facility={facility}
                  onEdit={setEditingFacility}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      {editingFacility && (
        <EditListingModal
          facility={editingFacility}
          isOpen={!!editingFacility}
          onClose={() => setEditingFacility(null)}
          onSave={handleSave}
        />
      )}

      <Footer />
    </div>
  );
}
