import React from 'react';
import { Substance } from '../types';

interface SubstancesSectionProps {
  substances: Substance[];
  isVerified?: boolean;
}

export default function SubstancesSection({ substances, isVerified }: SubstancesSectionProps) {
  if (!substances || substances.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Substances We Treat</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {substances.map((substance) => (
          <div key={substance.id} className="flex flex-col items-center text-center">
            {substance.logo && (
              <img
                src={substance.logo}
                alt={substance.name}
                className="w-16 h-16 object-contain mb-3"
              />
            )}
            <h3 className="font-medium text-gray-900">{substance.name}</h3>
            {isVerified && substance.description && (
              <p className="text-sm text-gray-600 mt-1">{substance.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
