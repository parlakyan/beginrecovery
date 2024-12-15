import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RehabCard from '../components/RehabCard';
import EditListingModal from '../components/EditListingModal';
import Tabs from '../components/ui/Tabs';

export default function AccountPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'listings';
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [listings, setListings] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  // Fetch user's listings
  useEffect(() => {
    const fetchListings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await facilitiesService.getUserListings(user.id);
        setListings(data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [user]);

  // Scroll to top on mount and tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

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

  const handleTabChange = (tab: string) => {
    // Scroll to top before changing tab
    window.scrollTo(0, 0);
    setSearchParams({ tab });
  };

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
  };

  const handleSave = async (data: Partial<Facility>) => {
    if (!editingFacility) return;
    try {
      await facilitiesService.updateFacility(editingFacility.id, data);
      // Refresh listings
      if (user) {
        const updatedListings = await facilitiesService.getUserListings(user.id);
        setListings(updatedListings);
      }
      setEditingFacility(null);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  const handleFacilityUpdate = (updatedFacility: Facility) => {
    setListings(prevListings => 
      prevListings.map(listing => 
        listing.id === updatedFacility.id ? updatedFacility : listing
      )
    );
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleChangePassword = () => {
    navigate('/reset-password');
  };

  if (!user) {
    return null;
  }

  // Define tab contents
  const ListingsContent = () => (
    <div>
      {/* Create Listing Button */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/create-listing')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Listing
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((facility) => (
            <RehabCard
              key={facility.id}
              facility={facility}
              onEdit={handleEdit}
              onUpdate={handleFacilityUpdate}
              showOwnerControls
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Listings Yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first listing to get started
          </p>
          <button
            onClick={() => navigate('/create-listing')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Listing
          </button>
        </div>
      )}
    </div>
  );

  const SettingsContent = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
      <div className="space-y-6">
        {/* Account Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="mt-1">
              <input
                type="email"
                value={user.email || ''}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <div className="mt-1">
              <input
                type="text"
                value={user.role || ''}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
          <div className="space-y-3">
            <button
              onClick={handleChangePassword}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={handleSignOut}
              className="w-full bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    {
      id: 'listings',
      label: 'My Listings',
      content: <ListingsContent />
    },
    {
      id: 'settings',
      label: 'Account Settings',
      content: <SettingsContent />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 mt-2">
              Manage your listings and account settings
            </p>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {editingFacility && (
        <EditListingModal
          facility={editingFacility}
          isOpen={true}
          onClose={() => setEditingFacility(null)}
          onSave={handleSave}
        />
      )}

      <Footer />
    </div>
  );
}
