import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Building2, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { facilitiesService } from '../services/facilities';
import { generateSlug } from '../services/facilities/utils';
import { usersService } from '../services/users';
import { licensesService } from '../services/licenses';
import { insurancesService } from '../services/insurances';
import { conditionsService } from '../services/conditions';
import { therapiesService } from '../services/therapies';
import { treatmentTypesService } from '../services/treatmentTypes';
import { storageService } from '../services/storage';
import { amenitiesService } from '../services/amenities';
import { languagesService } from '../services/languages';
import { substancesService } from '../services/substances';
import { Facility, License, Insurance, Condition, Therapy, TreatmentType, Substance, Amenity, Language } from '../types';
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
  website?: string;
  highlights: string[];
  treatmentTypes: TreatmentType[];
  substances: Substance[];
  conditions: Condition[];
  therapies: Therapy[];
  amenityObjects: Amenity[];
  insurances: Insurance[];
  languageObjects: Language[];
  licenses: License[];
}

const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

export default function CreateListing() {
  const navigate = useNavigate();
  const { user, refreshToken } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [availableLicenses, setAvailableLicenses] = useState<License[]>([]);
  const [availableInsurances, setAvailableInsurances] = useState<Insurance[]>([]);
  const [availableConditions, setAvailableConditions] = useState<Condition[]>([]);
  const [availableTherapies, setAvailableTherapies] = useState<Therapy[]>([]);
  const [availableTreatmentTypes, setAvailableTreatmentTypes] = useState<TreatmentType[]>([]);
  const [availableSubstances, setAvailableSubstances] = useState<Substance[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<CreateListingForm>({
    defaultValues: {
      highlights: [],
      treatmentTypes: [],
      substances: [],
      conditions: [],
      therapies: [],
      amenityObjects: [],
      insurances: [],
      languageObjects: [],
      licenses: [],
      city: '',
      state: '',
      website: undefined
    }
  });

  // Watch form values for DropdownSelect components
  const highlights = watch('highlights');
  const treatmentTypes = watch('treatmentTypes');
  const substances = watch('substances');
  const conditions = watch('conditions');
  const therapies = watch('therapies');
  const amenityObjects = watch('amenityObjects');
  const selectedLicenses = watch('licenses');
  const selectedInsurances = watch('insurances');
  const languageObjects = watch('languageObjects');

  // Generate a temporary ID for photo uploads
  const tempId = React.useMemo(() => 'temp-' + Date.now(), []);

  // Fetch available options
  React.useEffect(() => {
    const fetchData = async () => {
      const [
        licenses,
        insurances,
        conditions,
        therapies,
        treatmentTypes,
        substances,
        amenities,
        languages
      ] = await Promise.all([
        licensesService.getLicenses(),
        insurancesService.getInsurances(),
        conditionsService.getConditions(),
        therapiesService.getTherapies(),
        treatmentTypesService.getTreatmentTypes(),
        substancesService.getSubstances(),
        amenitiesService.getAmenities(),
        languagesService.getLanguages()
      ]);
      setAvailableLicenses(licenses);
      setAvailableInsurances(insurances);
      setAvailableConditions(conditions);
      setAvailableTherapies(therapies);
      setAvailableTreatmentTypes(treatmentTypes);
      setAvailableSubstances(substances);
      setAvailableAmenities(amenities);
      setAvailableLanguages(languages);
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

  const handleLogoChange = useCallback((newLogo: string | undefined) => {
    setLogo(newLogo);
  }, []);

  const onSubmit = async (data: CreateListingForm) => {
    setLoading(true);
    setError(null);

    try {
      // Process form data - exclude logo field completely
      const formattedData: Partial<Facility> = {
        name: data.name,
        description: data.description,
        location: data.location,
        coordinates: data.coordinates,
        city: data.city,
        state: data.state,
        phone: data.phone,
        email: data.email,
        website: data.website,
        highlights: data.highlights || [],
        treatmentTypes: data.treatmentTypes || [],
        substances: data.substances || [],
        conditions: data.conditions || [],
        therapies: data.therapies || [],
        amenityObjects: data.amenityObjects || [],
        insurances: data.insurances || [],
        languageObjects: data.languageObjects || [],
        licenses: data.licenses || [],
        images: photos,
        // Initialize required fields with default values
        accreditation: [],
        rating: 0,
        reviews: 0,
        reviewCount: 0,
        isVerified: false,
        isFeatured: false,
        moderationStatus: 'pending' as const
      };

      // Create facility without logo field
      const { id } = await facilitiesService.createFacility(formattedData);

      // Move uploaded files from temp location to permanent location
      let updatedPhotos = [...photos];
      let updatedLogo = logo;

      if (photos.length > 0 || (logo && logo.trim() !== '')) {
        try {
          // Move photos if any
          if (photos.length > 0) {
            const { movedFiles: movedPhotos } = await storageService.moveFiles(
              `facilities/${tempId}/photos`,
              `facilities/${id}/photos`
            ).catch(err => {
              console.error('Error moving photos:', err);
              return { movedFiles: [] };
            });
            
            // Update photo URLs
            updatedPhotos = photos.map(oldUrl => {
              const moved = movedPhotos.find(m => m.oldUrl === oldUrl);
              return moved ? moved.newUrl : oldUrl;
            });
          }

          // Move logo if exists and not empty
          if (logo && logo.trim() !== '') {
            const { movedFiles: movedLogo } = await storageService.moveFiles(
              `facilities/${tempId}/logo`,
              `facilities/${id}/logo`
            ).catch(err => {
              console.error('Error moving logo:', err);
              return { movedFiles: [] };
            });
            
            // Update logo URL
            if (movedLogo.length > 0) {
              updatedLogo = movedLogo[0].newUrl;
            }
          }

          // Update facility with new URLs if needed
          const updateData: Partial<Facility> = {};
          if (updatedPhotos.length > 0) {
            updateData.images = updatedPhotos;
          }
          if (updatedLogo && updatedLogo.trim() !== '') {
            updateData.logo = updatedLogo;
          }

          if (Object.keys(updateData).length > 0) {
            await facilitiesService.updateFacility(id, updateData);
          }
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
      const backupData = {
        facilityId: id,
        facility: {
          ...formattedData,
          id,
          images: updatedPhotos,
          ...(updatedLogo && updatedLogo.trim() !== '' ? { logo: updatedLogo } : {})
        }
      };
      sessionStorage.setItem('facilityData', JSON.stringify(backupData));

      // Navigate to payment with facility ID and scroll to top
      navigate('/payment', { 
        state: { 
          facilityId: id,
          facility: {
            ...formattedData,
            id,
            images: updatedPhotos,
            ...(updatedLogo && updatedLogo.trim() !== '' ? { logo: updatedLogo } : {})
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
              {/* Basic Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Name <span className="text-red-500">*</span>
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
                  Description <span className="text-red-500">*</span>
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
                  Location <span className="text-red-500">*</span>
                </label>
                <AddressAutocomplete
                  register={register}
                  setValue={setValue}
                  error={errors.location?.message}
                  hideLabel={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
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
                  Email Address <span className="text-red-500">*</span>
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
                  Website
                </label>
                <input
                  {...register('website')}
                  type="url"
                  placeholder="https://www.example.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Logo
                </label>
                <LogoUpload
                  facilityId={tempId}
                  existingLogo={logo}
                  onLogoChange={handleLogoChange}
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
                  value={(treatmentTypes || []).map(t => t.id)}
                  onChange={(values) => {
                    const selected = availableTreatmentTypes.filter(t => values.includes(t.id));
                    setValue('treatmentTypes', selected);
                  }}
                  options={availableTreatmentTypes.map(type => ({
                    value: type.id,
                    label: type.name
                  }))}
                  error={errors.treatmentTypes?.message}
                  useManagedOptions={true}
                />

                <DropdownSelect
                  label="Substances We Treat"
                  type="substances"
                  value={(substances || []).map(s => s.id)}
                  onChange={(values) => {
                    const selected = availableSubstances.filter(s => values.includes(s.id));
                    setValue('substances', selected);
                  }}
                  options={availableSubstances.map(substance => ({
                    value: substance.id,
                    label: substance.name
                  }))}
                  error={errors.substances?.message}
                />

                <DropdownSelect
                  label="Conditions We Treat"
                  type="conditions"
                  value={(conditions || []).map(c => c.id)}
                  onChange={(values) => {
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
                  value={(therapies || []).map(t => t.id)}
                  onChange={(values) => {
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
                  value={(amenityObjects || []).map(a => a.id)}
                  onChange={(values) => {
                    const selected = availableAmenities.filter(a => values.includes(a.id));
                    setValue('amenityObjects', selected);
                  }}
                  options={availableAmenities.map(amenity => ({
                    value: amenity.id,
                    label: amenity.name
                  }))}
                  error={errors.amenityObjects?.message}
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
                  label="Languages"
                  type="languages"
                  value={(languageObjects || []).map(l => l.id)}
                  onChange={(values) => {
                    const selected = availableLanguages.filter(l => values.includes(l.id));
                    setValue('languageObjects', selected);
                  }}
                  options={availableLanguages.map(language => ({
                    value: language.id,
                    label: language.name
                  }))}
                  error={errors.languageObjects?.message}
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
                  {loading ? 'Creating...' : 'Create Listing'}
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
