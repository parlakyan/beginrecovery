import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Tabs } from '../components/ui';
import FacilitiesPage from './admin/FacilitiesPage';
import LocationsPage from './admin/LocationsPage';
import UsersPage from './admin/UsersPage';

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'facilities';
  const navigate = useNavigate();
  const { user } = useAuthStore();

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

  const handleTabChange = (tab: string) => {
    // Scroll to top before changing tab
    window.scrollTo(0, 0);
    setSearchParams({ tab });
  };

  const tabs = [
    {
      id: 'facilities',
      label: 'Facilities',
      content: <FacilitiesPage />
    },
    {
      id: 'locations',
      label: 'Featured Locations',
      content: <LocationsPage />
    },
    {
      id: 'users',
      label: 'Users',
      content: <UsersPage />
    }
  ];

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage facilities, featured locations, and users
            </p>
          </div>

          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
