import React from 'react';
import { Shield } from 'lucide-react';
import { Insurance } from '../types';

interface InsurancesSectionProps {
  insurances: Insurance[] | undefined;
}

export default function InsurancesSection({ insurances }: InsurancesSectionProps) {
  if (!insurances?.length) {
    return null;
  }

  return (
    <section className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold">Insurance Providers</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {insurances.map((insurance) => (
          <div key={insurance.id} className="text-center">
            <img
              src={insurance.logo}
              alt={insurance.name}
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold mb-2">{insurance.name}</h3>
            <p className="text-sm text-gray-600">{insurance.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
