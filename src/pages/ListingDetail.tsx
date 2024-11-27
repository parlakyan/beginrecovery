import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { facilitiesService } from '../services/firebase';
import { Facility, FacilityWithContact } from '../types';
import ContactBox from '../components/ContactBox';
import DetailCarousel from '../components/DetailCarousel';
import TabSection from '../components/TabSection';
import ReviewsSection from '../components/ReviewsSection';
import NearbyFacilities from '../components/NearbyFacilities';

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacility = async () => {
      if (!id) {
        setError('Facility ID is required');
        setLoading(false);
        return;
      }

      try {
        const facilityData = await facilitiesService.getFacilityById(id);
        if (facilityData) {
          setFacility(facilityData);
        } else {
          setError('Facility not found');
        }
      } catch (err) {
        setError('Error loading facility details');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacility();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600">{error || 'Facility not found'}</p>
        </div>
      </div>
    );
  }

  const facilityWithContact: FacilityWithContact = {
    ...facility,
    phone: facility.phone || '(555) 555-5555' // Provide default phone if not available
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{facility.name}</h1>
          <p className="text-gray-600">{facility.location}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <DetailCarousel images={facility.images} />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">About</h2>
              <p className="text-gray-600">{facility.description}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {facility.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {facility.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <TabSection facility={facility} />
            <ReviewsSection facility={facility} />
          </div>

          <div className="space-y-8">
            <ContactBox facility={facilityWithContact} />
            <NearbyFacilities facility={facility} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
