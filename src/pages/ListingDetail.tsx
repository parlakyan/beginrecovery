import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, ShieldCheck, ShieldAlert, Clock, MapPin, Star, Phone } from 'lucide-react';
import { facilitiesService } from '../services/facilities';
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
import { Button, Tag, Breadcrumb } from '../components/ui';
import EditListingModal from '../components/EditListingModal';

export default function ListingDetail() {
  const { slug, id } = useParams<{ slug?: string; id?: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Check if current user is owner or admin
  const canEdit = user && (user.role === 'admin' || (facility && user.id === facility.ownerId));

  const fetchFacility = useCallback(async () => {
    try {
      setLoading(true);
      let data = null;

      if (id) {
        // If we have an ID, fetch by ID and redirect to slug URL
        data = await facilitiesService.getFacilityById(id);
        if (data && data.slug) {
          navigate(`/${data.slug}`, { replace: true });
        }
      } else if (slug) {
        // If we have a slug, fetch by slug
        data = await facilitiesService.getFacilityBySlug(slug);
      }

      if (!data) {
        // If no facility found, redirect to 404
        navigate('/404', { replace: true });
        return;
      }

      setFacility(data);
    } catch (error) {
      console.error('Error fetching facility:', error);
      // On error, redirect to 404
      navigate('/404', { replace: true });
    } finally {
      setLoading(false);
    }
  }, [id, slug, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchFacility();
  }, [fetchFacility, slug]); // Add slug as dependency to refetch when URL changes

  const handleVerificationToggle = async () => {
    if (!facility) return;
    try {
      if (facility.isVerified) {
        await facilitiesService.unverifyFacility(facility.id);
      } else {
        await facilitiesService.verifyFacility(facility.id);
      }
      await fetchFacility(); // Refetch facility data
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const handleSave = async (data: Partial<Facility>) => {
    if (!facility) return;
    try {
      const updatedFacility = await facilitiesService.updateFacility(facility.id, data);
      if (updatedFacility && updatedFacility.slug !== slug) {
        // If the slug has changed, navigate to the new URL
        navigate(`/${updatedFacility.slug}`, { replace: true });
      } else {
        await fetchFacility(); // Refetch facility data
      }
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

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
    return null;
  }

  const breadcrumbItems = [
    { label: 'All Centers', href: '/search' },
    { label: 'USA', href: '/search?q=usa' }
  ];

  // Only add state if it exists (using state abbreviation)
  if (facility.state) {
    breadcrumbItems.push({
      label: facility.state.length === 2 ? facility.state : facility.state.substring(0, 2).toUpperCase(),
      href: `/search?q=${encodeURIComponent(facility.state)}`
    });
  }

  // Only add city if it exists
  if (facility.city) {
    breadcrumbItems.push({
      label: facility.city,
      href: `/search?q=${encodeURIComponent(facility.city)}`
    });
  }

  // Add facility name with empty href for current page
  breadcrumbItems.push({ label: facility.name, href: '' });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      {/* Sticky Breadcrumb Navigation - positioned below header */}
      <div className="sticky top-[65px] bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>
      
      <main className="flex-grow pb-20">
        {/* Hero Section with Image Carousel */}
        <div className="relative h-[50vh] min-h-[400px] bg-gray-900">
          <ImageCarousel 
            images={facility.images} 
            showNavigation={facility.images.length > 1}
            paginationPosition="elevated"
            isVerified={facility.isVerified}
          />
          
          {/* Admin and Owner Controls */}
          {canEdit && (
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <Button
                variant="secondary"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit Facility
              </Button>

              {user.role === 'admin' && (
                <>
                  <Button
                    variant="secondary"
                    onClick={handleVerificationToggle}
                    className={`flex items-center gap-2 ${
                      facility.isVerified 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {facility.isVerified ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4" />
                        Unverified
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Info Box */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{facility.name}</h1>
                    
                    {/* Location, Hours, and Phone */}
                    <div className="flex flex-col md:flex-row gap-6 mb-6">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>{facility.location}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>Open 24/7</span>
                      </div>
                      {facility.phone && (
                        <div className="flex items-center text-gray-600">
                          <Phone className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span>{facility.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6">{facility.description}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {facility.tags.map((tag: string, index: number) => (
                        <Tag key={index} variant="secondary">{tag}</Tag>
                      ))}
                    </div>

                    {/* Amenities */}
                    <div>
                      <h2 className="text-xl font-semibold mb-4">Amenities & Services</h2>
                      <div className="flex flex-wrap gap-2">
                        {facility.amenities.map((amenity: string, index: number) => (
                          <Tag key={index} variant="primary">{amenity}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Reviews Summary */}
                  <div className="flex flex-col items-center bg-surface px-6 py-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      <span className="text-2xl font-bold">{facility.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">Excellent</div>
                      <div className="text-sm text-gray-600">{facility.reviewCount} reviews</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certifications Section - Only for verified facilities with licenses */}
              {facility.isVerified && facility.licenses && facility.licenses.length > 0 && (
                <CertificationsSection licenses={facility.licenses} />
              )}

              {/* Reviews Section */}
              <ReviewsSection facility={facility} />

              {/* Staff Section - Only for verified facilities */}
              {facility.isVerified && <StaffSection />}

              {/* Map Section */}
              <MapSection 
                coordinates={facility.coordinates} 
                address={facility.location}
              />
            </div>

            {/* Contact Box - Sticky */}
            <div className="lg:col-span-1">
              <div className="sticky top-24" style={{ zIndex: 1 }}>
                <ContactBox facility={facility} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {isEditModalOpen && (
        <EditListingModal
          facility={facility}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <Footer />
    </div>
  );
}
