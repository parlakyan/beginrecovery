import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Facility, License, Insurance, Condition, Substance, Therapy, TreatmentType } from '../types';
import PhotoUpload from './PhotoUpload';
import LogoUpload from './LogoUpload';
import AddressAutocomplete from './AddressAutocomplete';
import DropdownSelect from './ui/DropdownSelect';
import { useAuthStore } from '../store/authStore';
import { licensesService } from '../services/licenses';
import { insurancesService } from '../services/insurances';
import { conditionsService } from '../services/conditions';
import { therapiesService } from '../services/therapies';
import { treatmentTypesService } from '../services/treatmentTypes';
import { substancesService } from '../services/substances';

interface EditListingModalProps {
  facility: Facility;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<Facility>) => Promise<void>;
}

interface EditListingForm {
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
  substances: Substance[];  // Changed from string[] to Substance[]
  conditions: Condition[];
  therapies: Therapy[];
  amenities: string[];
  insurance: string[];
  insurances: Insurance[];
  accreditation: string[];
  languages: string[];
  licenses: License[];
}

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const EditListingModal: React.FC<EditListingModalProps> = ({ facility, isOpen, onClose, onSave }) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EditListingForm>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Facility>>({
    images: [],
    logo: undefined
  });
  const [availableLicenses, setAvailableLicenses] = useState<License[]>([]);
  const [availableInsurances, setAvailableInsurances] = useState<Insurance[]>([]);
  const [availableConditions, setAvailableConditions] = useState<Condition[]>([]);
  const [availableTherapies, setAvailableTherapies] = useState<Therapy[]>([]);
  const [availableTreatmentTypes, setAvailableTreatmentTypes] = useState<TreatmentType[]>([]);
  const [availableSubstances, setAvailableSubstances] = useState<Substance[]>([]);
  const { user } = useAuthStore();

  // Check if user can edit this facility
  const canEdit = user && (
    user.role === 'admin' || 
    (user.role === 'owner' && user.id === facility.ownerId)
  );

  // Fetch available options
  useEffect(() => {
    const fetchData = async () => {
      const [licenses, insurances, conditions, therapies, treatmentTypes, substances] = await Promise.all([
        licensesService.getLicenses(),
        insurancesService.getInsurances(),
        conditionsService.getConditions(),
        therapiesService.getTherapies(),
        treatmentTypesService.getTreatmentTypes(),
        substancesService.getSubstances()
      ]);
      setAvailableLicenses(licenses);
      setAvailableInsurances(insurances);
      setAvailableConditions(conditions);
      setAvailableTherapies(therapies);
      setAvailableTreatmentTypes(treatmentTypes);
      setAvailableSubstances(substances);
    };
    fetchData();
  }, []);

  // Watch form values for DropdownSelect components
  const highlights = watch('highlights', []);
  const treatmentTypes = watch('treatmentTypes', []);
  const managedTreatmentTypes = watch('managedTreatmentTypes', []);
  const substances = watch('substances', []);
  const amenities = watch('amenities', []);
  const insurance = watch('insurance', []);
  const accreditation = watch('accreditation', []);
  const languages = watch('languages', []);
  const selectedLicenses = watch('licenses', []);
  const selectedInsurances = watch('insurances', []);
  const selectedConditions = watch('conditions', []);
  const selectedTherapies = watch('therapies', []);

  // Reset form when modal opens or facility changes
  useEffect(() => {
    if (isOpen && facility) {
      console.log('Resetting form with facility data:', {
        ...facility,
        canEdit,
        userRole: user?.role,
        userId: user?.id,
        facilityOwnerId: facility.ownerId
      });
      
      // Reset form fields
      reset({
        name: facility.name || '',
        description: facility.description || '',
        location: facility.location || '',
        coordinates: facility.coordinates,
        city: facility.city || '',
        state: facility.state || '',
        phone: facility.phone || '',
        email: facility.email || '',
        highlights: facility.highlights || [],
        treatmentTypes: facility.tags || [],  // For backward compatibility
        managedTreatmentTypes: facility.treatmentTypes?.map(t => t.id) || [],  // For new managed treatment types
        substances: facility.substances || [],
        conditions: facility.conditions || [],  // Pass full objects directly
        therapies: facility.therapies || [],   // Pass full objects directly
        amenities: facility.amenities || [],
        insurance: facility.insurance || [],
        insurances: facility.insurances || [],
        accreditation: facility.accreditation || [],
        languages: facility.languages || [],
        licenses: facility.licenses || []
      });

      // Reset form data with existing images and logo
      setFormData({
        images: facility.images || [],
        logo: facility.logo || undefined
      });

      console.log('Form data reset with logo:', facility.logo);
      setError(null);
    }
  }, [facility, isOpen, reset, user, canEdit]);

  const handlePhotosChange = useCallback((photos: string[]) => {
    console.log('Photos changed:', photos);
    setFormData(prev => ({
      ...prev,
      images: photos
    }));
  }, []);

  const handleLogoChange = useCallback((logo: string | undefined) => {
    console.log('Logo changed:', logo);
    setFormData(prev => ({
      ...prev,
      logo
    }));
  }, []);

  const onSubmit = async (data: EditListingForm) => {
    if (!canEdit) {
      setError('You do not have permission to edit this facility');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('Submitting form with data:', {
        ...data,
        images: formData.images,
        logo: formData.logo
      });

      // Convert IDs back to full objects for treatment types
      const treatmentTypes = data.managedTreatmentTypes.map(id =>
        availableTreatmentTypes.find(t => t.id === id)
      ).filter((t): t is TreatmentType => t !== undefined);

      await onSave({
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
        treatmentTypes,  // New managed treatment types
        substances: data.substances,
        conditions: data.conditions,  // Already full objects
        therapies: data.therapies,   // Already full objects
        amenities: data.amenities,
        insurance: data.insurance,
        insurances: data.insurances,
        accreditation: data.accreditation,
        languages: data.languages,
        licenses: data.licenses,
        images: formData.images,
        logo: formData.logo
      });
      onClose();
    } catch (err) {
      console.error('Error saving facility:', err);
      setError('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  if (!canEdit) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Permission Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to edit this facility.</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Edit Facility</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Name
            </label>
            <input
              {...register('name', { required: 'Facility name is required' })}
              type="text"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
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
              Phone
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
              facilityId={facility.id}
              existingLogo={formData.logo}
              onLogoChange={handleLogoChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photos
            </label>
            <PhotoUpload
              facilityId={facility.id}
              existingPhotos={formData.images || []}
              onPhotosChange={handlePhotosChange}
              isVerified={facility.isVerified}
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
              value={(selectedConditions || []).map(c => c.id)}  // Add null check
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
              value={(selectedTherapies || []).map(t => t.id)}  // Add null check
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

          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListingModal;
