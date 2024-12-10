import React from 'react';
import { Award } from 'lucide-react';
import { License } from '../types';

interface CertificationsSectionProps {
  licenses: License[];
}

export default function CertificationsSection({ licenses }: CertificationsSectionProps) {
  if (!licenses || licenses.length === 0) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <Award className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Certifications & Licenses</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {licenses.map((license) => (
          <div key={license.id} className="text-center">
            <img
              src={license.logo}
              alt={license.name}
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{license.name}</h3>
            <p className="text-sm text-gray-600">{license.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
