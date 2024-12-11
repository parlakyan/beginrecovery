import React from 'react';
import { Globe } from 'lucide-react';

interface LanguagesSectionProps {
  languages: string[];
}

export default function LanguagesSection({ languages }: LanguagesSectionProps) {
  if (!languages || languages.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Languages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{language}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
