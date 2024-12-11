import React from 'react';
import { Therapy } from '../types';

interface TherapiesSectionProps {
  therapies: Therapy[];
}

export default function TherapiesSection({ therapies }: TherapiesSectionProps) {
  if (!therapies || therapies.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Available Therapies</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {therapies.map((therapy) => (
          <div key={therapy.id} className="flex flex-col items-center text-center">
            {therapy.logo && (
              <img
                src={therapy.logo}
                alt={therapy.name}
                className="w-16 h-16 object-contain mb-3"
              />
            )}
            <h3 className="font-medium text-gray-900">{therapy.name}</h3>
            {therapy.description && (
              <p className="text-sm text-gray-600 mt-1">{therapy.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
