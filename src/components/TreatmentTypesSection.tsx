import React from 'react';
import { Activity } from 'lucide-react';
import { TreatmentType } from '../types';

interface TreatmentTypesSectionProps {
  treatmentTypes: TreatmentType[];
}

export default function TreatmentTypesSection({ treatmentTypes }: TreatmentTypesSectionProps) {
  if (!treatmentTypes || treatmentTypes.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Treatment Types</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {treatmentTypes.map((type) => (
          <div key={type.id} className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{type.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
