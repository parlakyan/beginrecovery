import { Phone, Mail } from 'lucide-react';
import { Facility } from '../types';

interface ContactBoxProps {
  facility: Facility;
}

export default function ContactBox({ facility }: ContactBoxProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h3>
      
      {/* Phone */}
      {facility.phone && (
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <Phone className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Phone</p>
            <a 
              href={`tel:${facility.phone}`}
              className="text-gray-900 hover:text-blue-600 transition-colors"
            >
              {facility.phone}
            </a>
          </div>
        </div>
      )}

      {/* Email */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-shrink-0">
          <Mail className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <a 
            href={`mailto:contact@${facility.name.toLowerCase().replace(/\s+/g, '')}.com`}
            className="text-gray-900 hover:text-blue-600 transition-colors"
          >
            Send Email
          </a>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="space-y-3">
        <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
          Request Information
        </button>
        <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors">
          Check Insurance Coverage
        </button>
      </div>

      {/* Additional Info */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="font-medium text-gray-900 mb-2">Facility Status</h4>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span>Currently accepting patients</span>
        </div>
      </div>
    </div>
  );
}
