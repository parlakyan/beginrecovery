import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/firebase';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface CreateListingForm {
  name: string;
  description: string;
  location: string;
  phone: string;
  images: string;
  amenities: string;
  tags: string;
}

export default function CreateListing() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateListingForm>();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Redirect non-logged-in users to register
  React.useEffect(() => {
    if (!user) {
      navigate('/register', { 
        state: { 
          returnUrl: '/create-listing',
          userType: 'owner'
        }
      });
    }
  }, [user, navigate]);

  const onSubmit = async (data: CreateListingForm) => {
    setLoading(true);
    setError(null);

    try {
      // Process form data
      const formattedData = {
        ...data,
        images: data.images.split(',').map(url => url.trim()).filter(Boolean),
        amenities: data.amenities.split(',').map(a => a.trim()).filter(Boolean),
        tags: data.tags.split(',').map(t => t.trim()).filter(Boolean)
      };

      // Create facility
      const { id } = await facilitiesService.createFacility(formattedData);

      // Navigate to payment with facility ID
      navigate('/payment', { 
        state: { 
          facilityId: id,
          facility: formattedData
        }
      });
    } catch (err) {
      console.error('Error creating facility:', err);
      setError('Failed to create facility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-8">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold">Create Your Listing</h1>
            </div>

            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Name
                </label>
                <input
                  {...register('name', { required: 'Facility name is required' })}
                  type="text"
                  placeholder="Enter facility name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  {...register('description', { required: 'Description is required' })}
                  rows={4}
                  placeholder="Describe your facility"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  {...register('location', { required: 'Location is required' })}
                  type="text"
                  placeholder="Full address"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.location && (
                  <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register('phone', { required: 'Phone number is required' })}
                  type="tel"
                  placeholder="Contact phone number"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Images
                </label>
                <input
                  {...register('images')}
                  type="text"
                  placeholder="Enter image URLs separated by commas"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">Add multiple image URLs separated by commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities
                </label>
                <input
                  {...register('amenities')}
                  type="text"
                  placeholder="Enter amenities separated by commas"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">Example: Pool, Gym, Private Rooms</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Types
                </label>
                <input
                  {...register('tags')}
                  type="text"
                  placeholder="Enter treatment types separated by commas"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="mt-1 text-sm text-gray-500">Example: Alcohol Rehab, Drug Treatment, Mental Health</p>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {loading ? 'Creating...' : 'Continue to Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}