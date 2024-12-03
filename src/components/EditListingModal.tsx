import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Facility } from '../types';
import PhotoUpload from './PhotoUpload';
import AddressAutocomplete from './AddressAutocomplete';
import FilterButton from './ui/FilterButton';

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
  logo?: string;
  phone: string;
  email: string;
  highlights: string[];
  amenities: string[];
  treatmentTypes: string[];
  substances: string[];
  insurance: string[];
  accreditation: string[];
  languages: string[];
}

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

const EditListingModal = ({ facility, isOpen, onClose, onSave }: EditListingModalProps) => {
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EditListingForm>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Facility>>({
    images: []
  });

  // Watch form values for FilterButton components
  const highlights = watch('highlights', []);
  const amenities = watch('amenities', []);
  const treatmentTypes = watch('treatmentTypes', []);
  const substances = watch('substances', []);
  const insurance = watch('insurance', []);
  const accreditation = watch('accreditation', []);
  const languages = watch('languages', []);

  // Reset form when modal opens or facility changes
  useEffect(() => {
    if (isOpen && facility) {
      // Reset form fields
      reset({
        name: facility.name || '',
        description: facility.description || '',
        location: facility.location || '',
        coordinates: facility.coordinates,
        logo: facility.logo,
        phone: facility.phone || '',
        email: facility.email || '',
        highlights: facility.highlights || [],
        amenities: facility.amenities || [],
        treatmentTypes: facility.treatmentTypes || [],
        substances: facility.substances || [],
        insurance: facility.insurance || [],
        accreditation: facility.accreditation || [],
        languages: facility.languages || []
      });

      // Reset form data
      setFormData({
        images: facility.images || []
      });
    }
  }, [facility, isOpen, reset]);

  const handlePhotosChange = (photos: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: photos
    }));
  };

  const onSubmit = async (data: EditListingForm) => {
    try {
      setLoading(true);
      await onSave({
        ...data,
        images: formData.images
      });
      onClose();
    } catch (error) {
      console.error('Error saving facility:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
              Logo
            </label>
            <PhotoUpload
              facilityId={facility.id}
              existingPhotos={facility.logo ? [facility.logo] : []}
              onPhotosChange={(photos) => setValue('logo', photos[0])}
              isVerified={facility.isVerified}
              maxPhotos={1}
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
            <FilterButton
              label="Highlights"
              type="highlights"
              value={highlights}
              onChange={(values) => setValue('highlights', values)}
              error={errors.highlights?.message}
            />

            <FilterButton
              label="Amenities"
              type="amenities"
              value={amenities}
              onChange={(values) => setValue('amenities', values)}
              error={errors.amenities?.message}
            />

            <FilterButton
              label="Treatment Types"
              type="treatmentTypes"
              value={treatmentTypes}
              onChange={(values) => setValue('treatmentTypes', values)}
              error={errors.treatmentTypes?.message}
            />

            <FilterButton
              label="Substances We Treat"
              type="substances"
              value={substances}
              onChange={(values) => setValue('substances', values)}
              error={errors.substances?.message}
            />

            <FilterButton
              label="Insurance Accepted"
              type="insurance"
              value={insurance}
              onChange={(values) => setValue('insurance', values)}
              error={errors.insurance?.message}
            />

            <FilterButton
              label="Accreditation"
              type="accreditation"
              value={accreditation}
              onChange={(values) => setValue('accreditation', values)}
              error={errors.accreditation?.message}
            />

            <FilterButton
              label="Languages"
              type="languages"
              value={languages}
              onChange={(values) => setValue('languages', values)}
              error={errors.languages?.message}
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
