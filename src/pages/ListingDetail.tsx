import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Edit2 } from 'lucide-react';
import { facilitiesService } from '../services/firebase';
import { useAuthStore } from '../store/authStore';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ImageCarousel from '../components/ImageCarousel';
import ContactBox from '../components/ContactBox';
import ReviewsSection from '../components/ReviewsSection';
import MapSection from '../components/MapSection';
import StaffSection from '../components/StaffSection';
import CertificationsSection from '../components/CertificationsSection';

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchFacility = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await facilitiesService.getFacilityById(id);
        if (data && data.moderationStatus === 'approved') {
          setFacility(data);
        }
      } catch (error) {
        console.error('Error fetching facility:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Facility Not Found</h2>
            <p className="mt-2 text-gray-600">The facility you're looking for doesn't exist or isn't available.</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const coordinates = { lat: 34.0522, lng: -118.2437 };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="relative">
        {/* Hero Section with Image Carousel */}
        <div className="relative h-[50vh] min-h-[400px] bg-gray-900">
          <ImageCarousel 
            images={facility.images} 
            showNavigation={facility.images.length > 1}
          />
          
          {/* Admin Edit Button */}
          {user?.role === 'admin' && (
            <Link
              to={`/admin/listings/${facility.id}/edit`}
              className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg hover:bg-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Listing</span>
            </Link>
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
                <p className="mt-2 text-gray-600">{facility.location}</p>
                
                {/* Tags */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {facility.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Description */}
                <div className="mt-6 prose prose-blue max-w-none">
                  <h2 className="text-xl font-semibold mb-4">About This Facility</h2>
                  <p>{facility.description}</p>
                </div>

                {/* Amenities */}
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Amenities & Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {facility.amenities.map((amenity, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Certifications Section - Only for verified facilities */}
              {facility.isVerified && <CertificationsSection />}

              {/* Reviews Section */}
              <ReviewsSection facility={facility} />

              {/* Staff Section - Only for verified facilities */}
              {facility.isVerified && <StaffSection />}

              {/* Map Section */}
              <MapSection coordinates={coordinates} />
            </div>

            {/* Contact Box - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContactBox facility={facility} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
