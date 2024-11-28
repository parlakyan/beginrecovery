import { Phone, Mail, Globe, MapPin, Clock, Building2, ShieldCheck } from 'lucide-react';
import { Facility } from '../types';

interface ContactBoxProps {
  facility: Facility;
}

export default function ContactBox({ facility }: ContactBoxProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Logo Section - Only for verified facilities */}
      {facility.isVerified && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <Building2 className="w-16 h-16 text-gray-400" />
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium">Verified Treatment Center</span>
            </div>
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="p-6 space-y-6">
        <div className="space-y-4">
          {facility.phone && (
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <a 
                  href={`tel:${facility.phone}`}
                  className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
                >
                  {facility.phone}
                </a>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a 
                href={`mailto:contact@${facility.name.toLowerCase().replace(/\s+/g, '')}.com`}
                className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
              >
                Send Email
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Website</p>
              <a 
                href={`https://${facility.name.toLowerCase().replace(/\s+/g, '')}.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
              >
                Visit Website
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <a 
                href={`https://maps.google.com/?q=${encodeURIComponent(facility.location)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-blue-600 transition-colors font-medium"
              >
                {facility.location}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Hours</p>
              <p className="text-gray-900 font-medium">Open 24/7</p>
            </div>
          </div>
        </div>

        {/* Insurance Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Insurance Accepted</h4>
          <p className="text-sm text-blue-700">
            We work with most major insurance providers. Contact us to verify your coverage.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Request Information
          </button>
          <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium">
            Check Insurance Coverage
          </button>
        </div>

        {/* Facility Status - Only for verified facilities */}
        {facility.isVerified && (
          <div className="pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-2">Facility Status</h4>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span>Currently accepting patients</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
