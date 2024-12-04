import React from 'react';
import { X } from 'lucide-react';
import { FeaturedLocation } from '../types';
import LocationImageUpload from './LocationImageUpload';

interface EditLocationModalProps {
  location: FeaturedLocation;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<FeaturedLocation>) => Promise<void>;
}

/**
 * Modal for editing featured location details
 * Currently only supports image upload
 */
export default function EditLocationModal({ 
  location, 
  isOpen, 
  onClose, 
  onSave 
}: EditLocationModalProps) {
  const handleImageChange = async (image: string | undefined) => {
    try {
      await onSave({ image });
    } catch (error) {
      console.error('Error updating location image:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Edit Location</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Location Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">{location.city}, {location.state}</h3>
            <p className="text-gray-600">{location.totalListings} listings</p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location Image
            </label>
            <LocationImageUpload
              locationId={location.id}
              existingImage={location.image}
              onImageChange={handleImageChange}
            />
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
