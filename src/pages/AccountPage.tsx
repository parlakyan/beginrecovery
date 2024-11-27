import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import ListingCard from '../components/ListingCard';

interface User {
  id: string;
  email: string | null;
  role: 'user' | 'owner' | 'admin';
  createdAt?: string;
}

const AccountPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (user) {
        try {
          const userListings = await facilitiesService.getUserListings(user.id);
          setListings(userListings);
        } catch (error) {
          console.error('Error fetching listings:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchListings();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Account Details</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <p className="mt-1 text-gray-800">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Role</label>
            <p className="mt-1 text-gray-800 capitalize">{user?.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Member Since</label>
            <p className="mt-1 text-gray-800">
              {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {user?.role === 'owner' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Your Listings</h2>
            <button
              onClick={() => navigate('/create-listing')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add New Listing
            </button>
          </div>

          {listings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
              <button
                onClick={() => navigate('/create-listing')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Listing
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  facility={listing}
                  onEdit={() => navigate(`/listing/${listing.id}/edit`)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountPage;
