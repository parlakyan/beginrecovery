import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  ListFilter, 
  Plus, 
  Search, 
  Edit2, 
  Archive, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  X,
  ShieldCheck,
  ShieldAlert,
  Star,
  RotateCcw,
  ExternalLink,
  MapPin,
  Users
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import EditListingModal from '../components/EditListingModal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { Tabs } from '../components/ui';

// Move existing listings functionality to a separate component
const ListingsTab: React.FC = () => {
  // ... (copy all the existing listings functionality here)
  return (
    <div className="p-6">
      <h2>Listings Management</h2>
      {/* Add existing listings functionality here */}
    </div>
  );
};

const LocationsTab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/admin/locations')}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Manage Featured Locations
      </button>
    </div>
  );
};

const UsersTab: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/admin/users')}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Manage Users
      </button>
    </div>
  );
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('listings');

  // Redirect if not admin
  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (user?.role !== 'admin') {
      console.log('AdminDashboard - Unauthorized Access:', {
        userEmail: user?.email,
        userRole: user?.role,
        redirecting: true
      });
      navigate('/');
    }
  }, [user, navigate]);

  const tabs = [
    {
      id: 'listings',
      label: 'Listings',
      content: <ListingsTab />
    },
    {
      id: 'locations',
      label: 'Featured Locations',
      content: <LocationsTab />
    },
    {
      id: 'users',
      label: 'Users',
      content: <UsersTab />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/admin/locations')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <MapPin className="w-5 h-5" />
                  Manage Locations
                </button>
                <button
                  onClick={() => navigate('/admin/users')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                  <Users className="w-5 h-5" />
                  Manage Users
                </button>
              </div>
            </div>
          </div>

          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
