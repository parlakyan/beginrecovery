import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { facilitiesService } from '../services/firebase';
import SEOHead from '../components/SEOHead';
import DetailCarousel from '../components/DetailCarousel';
import TabSection from '../components/TabSection';
import ContactBox from '../components/ContactBox';
import StaffSection from '../components/StaffSection';
import InsuranceSection from '../components/InsuranceSection';
import CertificationsSection from '../components/CertificationsSection';
import ReviewsSection from '../components/ReviewsSection';
import MapSection from '../components/MapSection';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Loader2 } from 'lucide-react';
import { Facility } from '../types';

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [facility, setFacility] = useState<Facility | null>(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const loadFacility = async () => {
      if (!id) {
        navigate('/');
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const facilityData = await facilitiesService.getFacilityById(id);
        if (facilityData) {
          setFacility(facilityData);
        } else {
          setError('Facility not found');
        }
      } catch (err) {
        console.error('Error loading facility:', err);
        setError('Failed to load facility details');
      } finally {
        setLoading(false);
      }
    };

    loadFacility();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span>Loading facility details...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600">{error || 'Facility not found'}</p>
            <button 
              onClick={() => navigate('/')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Return to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${facility.name} - Recovery Center in ${facility.location}`}
        description={`${facility.name} offers comprehensive addiction treatment in ${facility.location}. ${facility.description.slice(0, 150)}...`}
        canonicalUrl={`${window.location.origin}/listing/${id}`}
        type="article"
      />

      <Header />

      <DetailCarousel images={facility.images} />

      <div className="container mx-auto px-4 -mt-16 relative z-10">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{facility.name}</h1>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{facility.rating}/5.0</div>
              <div className="text-sm text-gray-600">{facility.reviewCount} Reviews</div>
            </div>
          </div>
          <p className="text-gray-600 mb-6">{facility.description}</p>
          <div className="flex flex-wrap gap-2">
            {facility.tags.map((tag, index) => (
              <span
                key={`tag-${index}`}
                className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TabSection 
              facility={facility} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
            <StaffSection />
            <InsuranceSection />
            <CertificationsSection />
            <ReviewsSection facility={{ rating: facility.rating, reviewCount: facility.reviewCount }} />
            <MapSection coordinates={{ lat: 34.0522, lng: -118.2437 }} />
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <ContactBox facility={facility} />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}