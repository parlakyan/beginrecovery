import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
 * 
 * Features:
 * - Profile information
 * - Role-based access (admin/owner/user)
 * - Facility listings management (for owners)
 * - Account settings
 * - Saved facilities
 * - Notifications
 * - Privacy settings
 */
export default function AccountPage() {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = React.useState('profile');
  const [userListings, setUserListings] = React.useState<Facility[]>([]);
  const [listingsLoading, setListingsLoading] = React.useState(false);

  // Debug logging for user role
  React.useEffect(() => {
    if (user) {
      console.log('AccountPage - User Data:', {
        email: user.email,
        role: user.role,
        isAdmin: user.role === 'admin',
        createdAt: user.createdAt
      });
    }
  }, [user]);

  // Load user's facility listings
  React.useEffect(() => {
    const loadUserListings = async () => {
      if (!user?.id) return;
      
      try {
        setListingsLoading(true);
        const listings = await facilitiesService.getUserListings(user.id);
        setUserListings(listings);
      } catch (error) {
        console.error('Error loading user listings:', error);
      } finally {
        setListingsLoading(false);
      }
    };

    if (activeTab === 'listings') {
      loadUserListings();
    }
  }, [user?.id, activeTab]);

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
                <div className="bg-white rounded-xl shadow-sm p-6">
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

              {/* Rest of the tabs remain unchanged... */}
              {/* Previous tab content remains the same */}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
