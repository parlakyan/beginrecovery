import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Settings, 
  Heart, 
  Bell, 
  Shield, 
  LogOut,
  Edit2,
  Loader2,
  Building2,
  Plus
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/firebase';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RehabCard from '../components/RehabCard';

/**
 * Account Page Component
 * Displays user profile and account management features
 */
export default function AccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState(() => {
    // Get initial tab from location state or default to 'profile'
    return (location.state as any)?.activeTab || 'profile';
  });
  const [userListings, setUserListings] = React.useState<Facility[]>([]);
  const [listingsLoading, setListingsLoading] = React.useState(false);

  // Load user's facility listings
  const loadUserListings = React.useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setListingsLoading(true);
      const listings = await facilitiesService.getUserListings(user.id);
      console.log('Loaded user listings:', listings.length);
      setUserListings(listings);
    } catch (error) {
      console.error('Error loading user listings:', error);
    } finally {
      setListingsLoading(false);
    }
  }, [user?.id]);

  // Load listings when tab changes or location state changes
  React.useEffect(() => {
    if (activeTab === 'listings') {
      loadUserListings();
    }
  }, [activeTab, loadUserListings, location.state]);

  // Loading state
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <User className="w-5 h-5" />
                Profile
              </button>
              
              {/* Owner-specific listings tab */}
              {user?.role === 'owner' && (
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                    activeTab === 'listings'
                      ? 'bg-blue-50 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Building2 className="w-5 h-5" />
                  My Listings
                </button>
              )}
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                Settings
              </button>
              
              <button
                onClick={() => setActiveTab('saved')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                  activeTab === 'saved'
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Heart className="w-5 h-5" />
                Saved Facilities
              </button>
              
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                  activeTab === 'notifications'
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Bell className="w-5 h-5" />
                Notifications
              </button>
              
              <button
                onClick={() => setActiveTab('privacy')}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left ${
                  activeTab === 'privacy'
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Shield className="w-5 h-5" />
                Privacy & Security
              </button>
              
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Profile Information</h2>
                    <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
                      <Edit2 className="w-4 h-4" />
                      Edit Profile
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 text-gray-900">{user?.email}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Type</label>
                      <div className="mt-1 text-gray-900 capitalize">{user?.role}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Member Since</label>
                      <div className="mt-1 text-gray-900">
                        {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Listings Tab */}
              {activeTab === 'listings' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold">My Listings</h2>
                    <Link
                      to="/create-listing"
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Listing
                    </Link>
                  </div>

                  {listingsLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : userListings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Listings Yet</h3>
                      <p className="text-gray-600 mb-6">Create your first facility listing to get started</p>
                      <Link
                        to="/create-listing"
                        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Create Listing
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {userListings.map((facility) => (
                        <RehabCard 
                          key={facility.id} 
                          facility={facility}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Email Preferences</h3>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span>Receive updates about saved facilities</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span>Receive newsletter</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span>Receive promotional emails</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Communication Settings</h3>
                      <div className="space-y-4">
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span>Enable SMS notifications</span>
                        </label>
                        <label className="flex items-center gap-3">
                          <input type="checkbox" className="rounded text-blue-600" />
                          <span>Enable browser notifications</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Saved Facilities Tab */}
              {activeTab === 'saved' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">Saved Facilities</h2>
                  
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 stroke-current" />
                    <p>You haven't saved any facilities yet.</p>
                    <Link 
                      to="/"
                      className="mt-4 inline-block text-blue-600 hover:text-blue-700"
                    >
                      Browse Facilities
                    </Link>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">Notifications</h2>
                  
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-4 stroke-current" />
                    <p>No new notifications</p>
                  </div>
                </div>
              )}

              {/* Privacy & Security Tab */}
              {activeTab === 'privacy' && (
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-2xl font-bold mb-6">Privacy & Security</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Password</h3>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        Change Password
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Two-Factor Authentication</h3>
                      <button className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200">
                        Enable 2FA
                      </button>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Data & Privacy</h3>
                      <div className="space-y-4">
                        <button className="text-blue-600 hover:text-blue-700">
                          Download my data
                        </button>
                        <button className="block text-red-600 hover:text-red-700">
                          Delete account
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
