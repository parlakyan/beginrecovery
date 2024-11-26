import React from 'react';
import { X } from 'lucide-react';

interface SearchFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    treatmentTypes: string[];
    amenities: string[];
    insurance: string[];
    rating: number | null;
    priceRange: [number, number] | null;
  };
  onFilterChange: (filters: any) => void;
}

const treatmentOptions = [
  'Alcohol Addiction',
  'Drug Addiction',
  'Dual Diagnosis',
  'Mental Health',
  'Prescription Drugs',
  'Behavioral Addiction'
];

const amenityOptions = [
  'Private Rooms',
  'Pool & Spa',
  'Fitness Center',
  'Meditation Garden',
  '24/7 Medical Staff',
  'Gourmet Dining',
  'Yoga Studio',
  'Art Therapy',
  'Private Beach Access'
];

const insuranceOptions = [
  'Blue Cross Blue Shield',
  'Aetna',
  'UnitedHealthcare',
  'Cigna',
  'Kaiser Permanente',
  'Humana',
  'Medicare',
  'Medicaid'
];

export default function SearchFilters({ isOpen, onClose, filters, onFilterChange }: SearchFiltersProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Filters</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Treatment Types */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Treatment Types</h3>
            <div className="space-y-2">
              {treatmentOptions.map((treatment) => (
                <label key={treatment} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.treatmentTypes.includes(treatment)}
                    onChange={(e) => {
                      const newTypes = e.target.checked
                        ? [...filters.treatmentTypes, treatment]
                        : filters.treatmentTypes.filter((t) => t !== treatment);
                      onFilterChange({ ...filters, treatmentTypes: newTypes });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{treatment}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Amenities</h3>
            <div className="space-y-2">
              {amenityOptions.map((amenity) => (
                <label key={amenity} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity)}
                    onChange={(e) => {
                      const newAmenities = e.target.checked
                        ? [...filters.amenities, amenity]
                        : filters.amenities.filter((a) => a !== amenity);
                      onFilterChange({ ...filters, amenities: newAmenities });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{amenity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Insurance */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Insurance Accepted</h3>
            <div className="space-y-2">
              {insuranceOptions.map((insurance) => (
                <label key={insurance} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.insurance.includes(insurance)}
                    onChange={(e) => {
                      const newInsurance = e.target.checked
                        ? [...filters.insurance, insurance]
                        : filters.insurance.filter((i) => i !== insurance);
                      onFilterChange({ ...filters, insurance: newInsurance });
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2">{insurance}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Minimum Rating</h3>
            <input
              type="range"
              min="0"
              max="5"
              step="0.5"
              value={filters.rating || 0}
              onChange={(e) => {
                onFilterChange({
                  ...filters,
                  rating: parseFloat(e.target.value) || null,
                });
              }}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Any</span>
              <span>{filters.rating || 0} Stars</span>
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Price Range (per month)</h3>
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Min"
                value={filters.priceRange?.[0] || ''}
                onChange={(e) => {
                  const min = parseInt(e.target.value);
                  onFilterChange({
                    ...filters,
                    priceRange: [min, filters.priceRange?.[1] || 50000],
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.priceRange?.[1] || ''}
                onChange={(e) => {
                  const max = parseInt(e.target.value);
                  onFilterChange({
                    ...filters,
                    priceRange: [filters.priceRange?.[0] || 0, max],
                  });
                }}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Apply Filters Button */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}