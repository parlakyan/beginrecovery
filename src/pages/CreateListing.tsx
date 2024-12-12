import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/facilities';
import { usersService } from '../services/users';
import { licensesService } from '../services/licenses';
import { insurancesService } from '../services/insurances';
import { conditionsService } from '../services/conditions';
import { therapiesService } from '../services/therapies';
import { treatmentTypesService } from '../services/treatmentTypes';
import { storageService } from '../services/storage';
import { Facility, License, Insurance, Condition, Therapy, TreatmentType } from '../types';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PhotoUpload from '../components/PhotoUpload';
import LogoUpload from '../components/LogoUpload';
import AddressAutocomplete from '../components/AddressAutocomplete';
import DropdownSelect from '../components/ui/DropdownSelect';

interface CreateListingForm {
  name: string;
  description: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  city: string;
  state: string;
  phone: string;
  email: string;
  highlights: string[];
  treatmentTypes: string[];  // For backward compatibility
  managedTreatmentTypes: string[];  // For new managed treatment types
  substances: string[];
  conditions: Condition[];  // Changed from string[] to Condition[]
  therapies: Therapy[];    // Changed from string[] to Therapy[]
  amenities: string[];
  insurance: string[];
  insurances: Insurance[];
  accreditation: string[];
  languages: string[];
  licenses: License[];
}

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export default function CreateListing() {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateListingForm>({
    defaultValues: {
      highlights: [],
      treatmentTypes: [],
      managedTreatmentTypes: [],
      substances: [],
      conditions: [],
      therapies: [],
      amenities: [],
      insurance: [],
      insurances: [],
      accreditation: [],
      languages: [],
      licenses: [],
      city: '',
      state: ''
    }
  });

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [logo, setLogo] = React.useState<string | undefined>(undefined);
  const [availableLicenses, setAvailableLicenses] = React.useState<License[]>([]);
  const [availableInsurances, setAvailableInsurances] = React.useState<Insurance[]>([]);
  const [availableConditions, setAvailableConditions] = React.useState<Condition[]>([]);
  const [availableTherapies, setAvailableTherapies] = React.useState<Therapy[]>([]);
  const [availableTreatmentTypes, setAvailableTreatmentTypes] = React.useState<TreatmentType[]>([]);
  const { user, refreshToken } = useAuthStore();
  const navigate = useNavigate();

  // Watch form values for DropdownSelect components
  const highlights = watch('highlights');
  const treatmentTypes = watch('treatmentTypes');
  const managedTreatmentTypes = watch('managedTreatmentTypes');
  const substances = watch('substances');
  const conditions = watch('conditions');
  const therapies = watch('therapies');
  const amenities = watch('amenities');
  const insurance = watch('insurance');
  const accreditation = watch('accreditation');
  const languages = watch('languages');
  const selectedLicenses = watch('licenses');
  const selectedInsurances = watch('insurances');

  // Generate a temporary ID for photo uploads
  const tempId = React.useMemo(() => 'temp-' + Date.now(), []);

  // Fetch available options
  React.useEffect(() => {
    const fetchData = async () => {
      const [licenses, insurances, conditions, therapies, treatmentTypes] = await Promise.all([
        licensesService.getLicenses(),
        insurancesService.getInsurances(),
        conditionsService.getConditions(),
        therapiesService.getTherapies(),
        treatmentTypesService.getTreatmentTypes()
      ]);
      setAvailableLicenses(licenses);
      setAvailableInsurances(insurances);
      setAvailableConditions(conditions);
      setAvailableTherapies(therapies);
      setAvailableTreatmentTypes(treatmentTypes);
    };
    fetchData();
  }, []);

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

      // Convert IDs to full objects for treatment types
      const selectedTreatmentTypes = data.managedTreatmentTypes.map(id =>
        availableTreatmentTypes.find(t => t.id === id)
      ).filter((t): t is TreatmentType => t !== undefined);

      // Process form data
      const formattedData: Partial<Facility> = {
        name: data.name,
        description: data.description,
        location: data.location,
        coordinates: data.coordinates,
        city: data.city,
        state: data.state,
        phone: data.phone,
        email: data.email,
        highlights: data.highlights,
        tags: data.treatmentTypes,  // For backward compatibility
        treatmentTypes: selectedTreatmentTypes,  // New managed treatment types
        substances: data.substances,
        conditions: data.conditions,  // Already full objects
        therapies: data.therapies,   // Already full objects
        amenities: data.amenities,
        insurance: data.insurance,
        insurances: data.insurances,
        accreditation: data.accreditation,
        languages: data.languages,
        licenses: data.licenses,
        images: photos,
        logo,
        moderationStatus: 'pending' as const
      };

      // Create facility
      const { id } = await facilitiesService.createFacility(formattedData);

      // Move uploaded files from temp location to permanent location
      let updatedPhotos = [...photos];
      let updatedLogo = logo;

      if (photos.length > 0 || logo) {
        try {
          // Move photos if any
          if (photos.length > 0) {
            const { movedFiles: movedPhotos } = await storageService.moveFiles(
              `facilities/${tempId}/photos`,
              `facilities/${id}/photos`
            );
            
            // Update photo URLs
            updatedPhotos = photos.map(oldUrl => {
              const moved = movedPhotos.find(m => m.oldUrl === oldUrl);
              return moved ? moved.newUrl : oldUrl;
            });
          }

          // Move logo if exists
          if (logo) {
            const { movedFiles: movedLogo } = await storageService.moveFiles(
              `facilities/${tempId}/logo`,
              `facilities/${id}/logo`
            );
            
            // Update logo URL
            if (movedLogo.length > 0) {
              updatedLogo = movedLogo[0].newUrl;
            }
          }

          // Update facility with new URLs
          await facilitiesService.updateFacility(id, {
            images: updatedPhotos,
            logo: updatedLogo
          });
        } catch (moveError) {
          console.error('Error moving files:', moveError);
          // Continue with the process even if file moving fails
          // The files will remain in temp location but facility is still created
        }
      }

      // Update user role to owner if they're currently a regular user
      if (user && user.role === 'user') {
        await usersService.updateUserRole(user.id, 'owner');
        // Force token refresh to update role in auth state
        await refreshToken();
      }

      // Store the data in sessionStorage as backup
      sessionStorage.setItem('facilityData', JSON.stringify({
        facilityId: id,
        facility: {
          ...formattedData,
          images: updatedPhotos,
          logo: updatedLogo
        }
      }));

      // Navigate to payment with facility ID and scroll to top
      navigate('/payment', { 
        state: { 
          facilityId: id,
          facility: {
            ...formattedData,
            images: updatedPhotos,
            logo: updatedLogo
          }
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
                  Facility Logo
                </label>
                <LogoUpload
                  facilityId={tempId}
                  existingLogo={logo}
                  onLogoChange={setLogo}
                />
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

              {/* Collection Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DropdownSelect
                  label="Highlights"
                  type="highlights"
                  value={highlights}
                  onChange={(values) => setValue('highlights', values)}
                  error={errors.highlights?.message}
                />

                <DropdownSelect
                  label="Treatment Types"
                  type="treatmentTypes"
                  value={treatmentTypes}
                  onChange={(values) => setValue('treatmentTypes', values)}
                  error={errors.treatmentTypes?.message}
                />

                <DropdownSelect
                  label="Managed Treatment Types"
                  type="treatmentTypes"
                  value={managedTreatmentTypes}
                  onChange={(values) => setValue('managedTreatmentTypes', values)}
                  useManagedOptions={true}
                  options={availableTreatmentTypes.map(type => ({
                    value: type.id,
                    label: type.name
                  }))}
                  error={errors.managedTreatmentTypes?.message}
                />

                <DropdownSelect
                  label="Substances We Treat"
                  type="substances"
                  value={substances}
                  onChange={(values) => setValue('substances', values)}
                  error={errors.substances?.message}
                />

                <DropdownSelect
                  label="Conditions We Treat"
                  type="conditions"
                  value={conditions.map(c => c.id)}  // Map full objects to IDs for value
                  onChange={(values) => {
                    // Convert IDs back to full objects
                    const selected = availableConditions.filter(c => values.includes(c.id));
                    setValue('conditions', selected);
                  }}
                  options={availableConditions.map(condition => ({
                    value: condition.id,
                    label: condition.name
                  }))}
                  error={errors.conditions?.message}
                />

                <DropdownSelect
                  label="Therapies"
                  type="therapies"
                  value={therapies.map(t => t.id)}  // Map full objects to IDs for value
                  onChange={(values) => {
                    // Convert IDs back to full objects
                    const selected = availableTherapies.filter(t => values.includes(t.id));
                    setValue('therapies', selected);
                  }}
                  options={availableTherapies.map(therapy => ({
                    value: therapy.id,
                    label: therapy.name
                  }))}
                  error={errors.therapies?.message}
                />

                <DropdownSelect
                  label="Amenities"
                  type="amenities"
                  value={amenities}
                  onChange={(values) => setValue('amenities', values)}
                  error={errors.amenities?.message}
                />

                <DropdownSelect
                  label="Insurance Accepted"
                  type="insurance"
                  value={insurance}
                  onChange={(values) => setValue('insurance', values)}
                  error={errors.insurance?.message}
                />

                <DropdownSelect
                  label="Insurance Providers"
                  type="insurances"
                  value={selectedInsurances.map(i => i.id)}
                  onChange={(values) => {
                    const selected = availableInsurances.filter(i => values.includes(i.id));
                    setValue('insurances', selected);
                  }}
                  options={availableInsurances.map(insurance => ({
                    value: insurance.id,
                    label: insurance.name
                  }))}
                  error={errors.insurances?.message}
                />

                <DropdownSelect
                  label="Accreditation"
                  type="accreditation"
                  value={accreditation}
                  onChange={(values) => setValue('accreditation', values)}
                  error={errors.accreditation?.message}
                />

                <DropdownSelect
                  label="Languages"
                  type="languages"
                  value={languages}
                  onChange={(values) => setValue('languages', values)}
                  error={errors.languages?.message}
                />

                <DropdownSelect
                  label="Certifications & Licenses"
                  type="licenses"
                  value={selectedLicenses.map(l => l.id)}
                  onChange={(values) => {
                    const selected = availableLicenses.filter(l => values.includes(l.id));
                    setValue('licenses', selected);
                  }}
                  options={availableLicenses.map(license => ({
                    value: license.id,
                    label: license.name
                  }))}
                  error={errors.licenses?.message}
                />
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
