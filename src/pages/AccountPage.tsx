import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Facility } from '../types';
import { facilitiesService } from '../services/firebase';
import useAuthStore from '../store/authStore';
import ListingCard from '../components/ListingCard';

export default function AccountPage() {
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [listings, setListings] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchListings = async () => {
      try {
        setLoading(true);
        const userListings = await facilitiesService.getUserListings(user.id);
        setListings(userListings);
      } catch (error) {
        console.error('Error fetching listings:', error);
        setError('Error loading your listings');
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your account and listings</p>
          </div>
          <button
            onClick={() => navigate('/create-listing')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Listing
          </button>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Email address</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user.email}</dd>
              </div>
              <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Account type</dt>
                <dd className="mt-1 text-sm text-gray-900 capitalize sm:mt-0 sm:col-span-2">{user.role}</dd>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Member since</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {new Date(user.createdAt).toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Listings</h2>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 mb-4">Create your first listing to get started</p>
              <button
                onClick={() => navigate('/create-listing')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Listing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
    </div>
  );
}
