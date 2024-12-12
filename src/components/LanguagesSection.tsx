import React from 'react';
import { Language } from '../types';

interface LanguagesSectionProps {
  languages: Language[];
  isVerified?: boolean;
}

export default function LanguagesSection({ languages, isVerified }: LanguagesSectionProps) {
  if (!languages || languages.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Languages Supported</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {languages.map((language) => (
          <div key={language.id} className="flex flex-col items-center text-center">
            {language.logo && (
              <img
                src={language.logo}
                alt={language.name}
                className="w-16 h-16 object-contain mb-3"
              />
            )}
            <h3 className="font-medium text-gray-900">{language.name}</h3>
            {isVerified && language.description && (
              <p className="text-sm text-gray-600 mt-1">{language.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
