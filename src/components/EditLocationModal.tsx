import React from 'react';
import { X } from 'lucide-react';
import { FeaturedLocation, CityInfo } from '../types';
import LocationImageUpload from './LocationImageUpload';

interface EditLocationModalProps {
  location: FeaturedLocation | CityInfo;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FeaturedLocation>) => void;
}

export default function EditLocationModal({
  location,
  isOpen,
  onClose,
  onSave
}: EditLocationModalProps) {
  if (!isOpen) return null;

  const handleSave = () => {
    // If it's a CityInfo, convert it to a FeaturedLocation
    if (!('id' in location)) {
      onSave({
        city: location.city,
        state: location.state,
        image: '',
        totalListings: location.totalListings,
        coordinates: location.coordinates,
        isFeatured: location.isFeatured
      });
    } else {
      onSave(location);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={onClose} />

      {/* Modal */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="relative bg-white rounded-lg shadow-lg max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">
              Edit Location
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="text-gray-900">
                {location.city}, {location.state}
              </div>
            </div>

            {'image' in location && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image
                </label>
                <LocationImageUpload
                  currentImage={location.image}
                  onUpload={(imageUrl: string) => onSave({ ...location, image: imageUrl })}
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
