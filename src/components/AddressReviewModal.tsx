import React, { useState } from 'react';
import { X, MapPin, AlertTriangle } from 'lucide-react';
import { Button } from './ui';
import { ImportedFacility } from '../services/imports/types';
import { facilitiesCrud } from '../services/facilities/crud';
import { Client, AddressType } from '@googlemaps/google-maps-services-js';

interface AddressReviewModalProps {
  facility: ImportedFacility;
  onClose: () => void;
  onUpdate: () => void;
}

export default function AddressReviewModal({ facility, onClose, onUpdate }: AddressReviewModalProps) {
  const [address, setAddress] = useState(facility.rawAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setLoading(true);
    setError(null);

    try {
      const googleMaps = new Client({});
      
      // Try to geocode the new address
      const response = await googleMaps.geocode({
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY || ''
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('Address not found');
      }

      const result = response.data.results[0];
      const { lat, lng } = result.geometry.location;

      // Extract city and state
      let city = '';
      let state = '';
      for (const component of result.address_components) {
        if (component.types.includes(AddressType.locality)) {
          city = component.long_name;
        }
        if (component.types.includes(AddressType.administrative_area_level_1)) {
          state = component.short_name;
        }
      }

      // Update facility with new address
      await facilitiesCrud.updateFacility(facility.facilityId, {
        location: result.formatted_address,
        coordinates: { lat, lng },
        city,
        state
      });

      // Update import record
      await onUpdate();
      onClose();

    } catch (err) {
      console.error('Error updating address:', err);
      setError(err instanceof Error ? err.message : 'Failed to update address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold">Review Address</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 text-yellow-800 rounded-lg mb-6">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium">Address Needs Review</div>
              <p className="text-sm mt-1">
                This address could not be fully matched. Please verify and update if needed.
              </p>
            </div>
          </div>

          {/* Facility Info */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900">{facility.name}</h3>
            <a 
              href={facility.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {facility.website}
            </a>
          </div>

          {/* Address Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Address
            </label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              rows={3}
              placeholder="Enter complete address"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="primary"
              onClick={handleUpdate}
              disabled={loading || !address}
              className="flex-1"
            >
              {loading ? 'Updating...' : 'Update Address'}
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
