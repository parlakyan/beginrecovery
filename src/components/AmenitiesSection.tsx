import React from 'react';
import { Amenity } from '../types';

interface AmenitiesSectionProps {
  amenities: Amenity[];
  isVerified?: boolean;
}

export default function AmenitiesSection({ amenities, isVerified }: AmenitiesSectionProps) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Amenities & Services</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {amenities.map((amenity) => (
          <div key={amenity.id} className="flex flex-col items-center text-center">
            {amenity.logo && (
              <img
                src={amenity.logo}
                alt={amenity.name}
                className="w-16 h-16 object-contain mb-3"
              />
            )}
            <h3 className="font-medium text-gray-900">{amenity.name}</h3>
            {isVerified && amenity.description && (
              <p className="text-sm text-gray-600 mt-1">{amenity.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
