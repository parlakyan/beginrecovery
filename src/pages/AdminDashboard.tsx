import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Tabs } from '../components/ui';
import FacilitiesPage from './admin/FacilitiesPage';
import LocationsPage from './admin/LocationsPage';
import UsersPage from './admin/UsersPage';
import LicensesPage from './admin/LicensesPage';
import InsurancesPage from './admin/InsurancesPage';
import ConditionsPage from './admin/ConditionsPage';
import SubstancesPage from './admin/SubstancesPage';
import TherapiesPage from './admin/TherapiesPage';
import TreatmentTypesPage from './admin/TreatmentTypesPage';
import AmenitiesPage from './admin/AmenitiesPage';
import LanguagesPage from './admin/LanguagesPage';
import ClaimsPage from './admin/ClaimsPage';
import DisputesPage from './admin/DisputesPage';
import ImportsPage from './admin/ImportsPage';

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
      id: 'claims',
      label: 'Claims',
      content: <ClaimsPage />
    },
    {
      id: 'disputes',
      label: 'Disputes',
      content: <DisputesPage />
    },
    {
      id: 'imports',
      label: 'Imports',
      content: <ImportsPage />
    },
    {
      id: 'locations',
      label: 'Locations',
      content: <LocationsPage />
    },
    {
      id: 'users',
      label: 'Users',
      content: <UsersPage />
    },
    {
      id: 'licenses',
      label: 'Licenses',
      content: <LicensesPage />
    },
    {
      id: 'insurances',
      label: 'Insurance',
      content: <InsurancesPage />
    },
    {
      id: 'conditions',
      label: 'Conditions',
      content: <ConditionsPage />
    },
    {
      id: 'substances',
      label: 'Substances',
      content: <SubstancesPage />
    },
    {
      id: 'therapies',
      label: 'Therapies',
      content: <TherapiesPage />
    },
    {
      id: 'treatmentTypes',
      label: 'Treatment Types',
      content: <TreatmentTypesPage />
    },
    {
      id: 'amenities',
      label: 'Amenities',
      content: <AmenitiesPage />
    },
    {
      id: 'languages',
      label: 'Languages',
      content: <LanguagesPage />
    }
  ];

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md">
          {/* Page Header */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Manage facilities, claims, disputes, imports, locations, users, licenses, insurance, conditions, substances, therapies, treatment types, amenities, and languages
            </p>
          </div>

          {/* Tabs Content */}
          <div className="p-6">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
