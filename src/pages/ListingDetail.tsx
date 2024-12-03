import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ShieldCheck, MapPin, Clock, Phone } from 'lucide-react';
import { facilitiesService } from '../services/facilities';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactBox from '../components/ContactBox';
import EditListingModal from '../components/EditListingModal';
import { Tag } from '../components/ui';
import { useAuthStore } from '../store/authStore';

interface CollectionGroup {
  label: string;
  items: string[];
  type: 'highlights' | 'tags' | 'substances' | 'amenities' | 'insurance' | 'accreditation' | 'languages';
}

export default function ListingDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchFacility = async () => {
      if (!slug) return;

      try {
        const data = await facilitiesService.getFacilityBySlug(slug);
        setFacility(data);
      } catch (error) {
        console.error('Error fetching facility:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [slug]);

  const handleVerificationToggle = async () => {
    if (!facility) return;

    try {
      if (facility.isVerified) {
        await facilitiesService.unverifyFacility(facility.id);
      } else {
        await facilitiesService.verifyFacility(facility.id);
      }
      
      // Refresh facility data
      const updated = await facilitiesService.getFacilityById(facility.id);
      setFacility(updated);
    } catch (error) {
      console.error('Error toggling verification:', error);
    }
  };

  const handleSave = async (data: Partial<Facility>) => {
    if (!facility) return;

    try {
      await facilitiesService.updateFacility(facility.id, data);
      // Refresh facility data
      const updated = await facilitiesService.getFacilityById(facility.id);
      setFacility(updated);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center min-h-[400px]">
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Facility Not Found</h1>
            <p className="text-gray-600 mb-4">The facility you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Return to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const collectionGroups: CollectionGroup[] = [
    { label: 'Highlights', items: facility.highlights, type: 'highlights' },
    { label: 'Treatment Types', items: facility.tags, type: 'tags' },
    { label: 'Substances We Treat', items: facility.substances, type: 'substances' },
    { label: 'Amenities', items: facility.amenities, type: 'amenities' },
    { label: 'Insurance Accepted', items: facility.insurance, type: 'insurance' },
    { label: 'Accreditation', items: facility.accreditation, type: 'accreditation' },
    { label: 'Languages', items: facility.languages, type: 'languages' }
  ];

  const isOwner = user?.id === facility.ownerId;
  const isAdmin = user?.role === 'admin';
  const canEdit = isOwner || isAdmin;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Admin Controls */}
          {isAdmin && (
            <div className="mb-6 flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
              <button
                onClick={handleVerificationToggle}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
              >
                {facility.isVerified ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-green-600" />
                    <span>Verified</span>
                  </>
                ) : (
                  <>
                    <Shield className="w-5 h-5 text-gray-400" />
                    <span>Not Verified</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="bg-white rounded-xl overflow-hidden">
                <img
                  src={facility.images[0] || 'https://via.placeholder.com/800x400?text=No+Image'}
                  alt={facility.name}
                  className="w-full aspect-video object-cover"
                />
              </div>

              {/* Facility Info */}
              <div className="bg-white rounded-xl p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold">{facility.name}</h1>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>{facility.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span>Open 24/7</span>
                      </div>
                      {facility.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-5 h-5" />
                          <span>{facility.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => setEditModalOpen(true)}
                      className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="prose max-w-none">
                  <p>{facility.description}</p>
                </div>

                {/* Collection Groups */}
                <div className="space-y-6">
                  {collectionGroups.map(group => 
                    group.items && group.items.length > 0 && (
                      <div key={group.type}>
                        <h3 className="text-lg font-semibold mb-3">{group.label}</h3>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map((item, index) => (
                            <Tag key={index} variant="primary">{item}</Tag>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <ContactBox facility={facility} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {canEdit && (
        <EditListingModal
          facility={facility}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSave}
        />
      )}

      <Footer />
    </div>
  );
}
