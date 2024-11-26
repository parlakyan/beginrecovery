import React from 'react';
import { Phone, MessageSquare, Globe } from 'lucide-react';

interface ContactBoxProps {
  facility: {
    phone: string;
    name: string;
  };
}

export default function ContactBox({ facility }: ContactBoxProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-6">Contact {facility.name}</h2>
      
      <div className="space-y-4">
        <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
          <Phone className="w-5 h-5" />
          {facility.phone}
        </button>

        <button className="w-full bg-gray-100 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Message Center
        </button>

        <button className="w-full border border-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <Globe className="w-5 h-5" />
          Visit Website
        </button>
      </div>

      <div className="mt-6 pt-6 border-t">
        <p className="text-sm text-gray-500 text-center">
          Your call is confidential. We'll connect you with a treatment specialist.
        </p>
      </div>
    </div>
  );
}