import React from 'react';
import { Pill } from 'lucide-react';

interface SubstancesSectionProps {
  substances: string[];
}

export default function SubstancesSection({ substances }: SubstancesSectionProps) {
  if (!substances || substances.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Substances We Treat</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {substances.map((substance, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Pill className="w-6 h-6 text-gray-400" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{substance}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
