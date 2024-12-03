import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/firebase';
import { usersService } from '../services/firebase';
import { Facility } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PhotoUpload from '../components/PhotoUpload';
import AddressAutocomplete from '../components/AddressAutocomplete';
import MultiSelect from '../components/ui/MultiSelect';

interface CreateListingForm {
  name: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  treatmentTypes: string[];
  amenities: string[];
  insurance: string[];
}

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export default function CreateListing() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateListingForm>({
    defaultValues: {
      treatmentTypes: [],
      amenities: [],
      insurance: []
    }
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [photos, setPhotos] = React.useState<string[]>([]);
  const { user, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  // Watch form values for MultiSelect components
  const treatmentTypes = watch('treatmentTypes');
  const amenities = watch('amenities');
  const insurance = watch('insurance');

  // Generate a temporary ID for photo uploads
  const tempId = React.useMemo(() => 'temp-' + Date.now(), []);

  // Redirect non-logged-in users to register
  React.useEffect(() => {
    if (!user) {
      navigate('/register', { 
        state: { 
          returnUrl: '/create-listing'
        }
      });
    }
  }, [user, navigate]);

  // Scroll to top on mount
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmit = async (data: CreateListingForm) => {
    setLoading(true);
    setError(null);

    try {
      // Refresh auth token first
      await refreshToken();

      // Process form data
      const formattedData: Partial<Facility> = {
        ...data,
        images: photos,
        moderationStatus: 'pending' as const
      };

      // Create facility
      const { id } = await facilitiesService.createFacility(formattedData);

      // Update user role to owner if they're currently a regular user
      if (user && user.role === 'user') {
        await usersService.updateUserRole(user.id, 'owner');
        // Force token refresh to update role in auth state
        await refreshToken();
      }

      // Store the data in sessionStorage as backup
      sessionStorage.setItem('facilityData', JSON.stringify({
        facilityId: id,
        facility: formattedData
      }));

      // Navigate to payment with facility ID and scroll to top
      navigate('/payment', { 
        state: { 
          facilityId: id,
          facility: formattedData
        },
        replace: true // Use replace to prevent back navigation to form
      });

      // Scroll to top after navigation
      window.scrollTo(0, 0);
    } catch (err) {
      console.error('Error creating facility:', err);
      
      if ((err as any).code?.startsWith('auth/')) {
        setError('Authentication error. Please try logging in again.');
        setTimeout(() => {
          navigate('/login', {
            state: {
              returnUrl: '/create-listing'
            }
          });
        }, 2000);
        return;
      }
      
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
          <div className="bg-white rounded-xl shadow-md p-6">
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

              <AddressAutocomplete
                register={register}
                setValue={setValue}
                error={errors.location?.message}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: {
                      value: phoneRegex,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  type="tel"
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: emailRegex,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  type="email"
                  placeholder="contact@facility.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Photos
                </label>
                <PhotoUpload
                  facilityId={tempId}
                  existingPhotos={photos}
                  onPhotosChange={setPhotos}
                  isVerified={false}
                />
              </div>

              <MultiSelect
                label="Treatment Types"
                type="treatment"
                value={treatmentTypes}
                onChange={(values) => setValue('treatmentTypes', values)}
                error={errors.treatmentTypes?.message}
              />

              <MultiSelect
                label="Amenities"
                type="amenity"
                value={amenities}
                onChange={(values) => setValue('amenities', values)}
                error={errors.amenities?.message}
              />

              <MultiSelect
                label="Insurance Accepted"
                type="insurance"
                value={insurance}
                onChange={(values) => setValue('insurance', values)}
                error={errors.insurance?.message}
              />

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
