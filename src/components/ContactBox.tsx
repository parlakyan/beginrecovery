import React from 'react';
import { Phone } from 'lucide-react';

interface ContactBoxProps {
  facility: {
    name: string;
    phone?: string;
  };
}

export default function ContactBox({ facility }: ContactBoxProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{facility.name}</h3>
      {facility.phone && (
        <div className="flex items-center text-gray-600">
          <Phone className="w-4 h-4 mr-2" />
          <a href={`tel:${facility.phone}`} className="hover:text-blue-600">
            {facility.phone}
          </a>
        </div>
      )}
    </div>
  );
}
