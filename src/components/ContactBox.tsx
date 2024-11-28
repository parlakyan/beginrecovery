import { Building2, ShieldCheck, Phone, Globe, MessageCircle } from 'lucide-react';
import { Facility } from '../types';
import { Button } from './ui';

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
        {/* Insurance Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Insurance Accepted</h4>
          <p className="text-sm text-blue-700">
            We work with most major insurance providers.{' '}
            <button 
              onClick={() => {/* Add insurance check handler */}} 
              className="text-blue-600 hover:text-blue-700 underline font-medium"
            >
              Check insurance coverage
            </button>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {facility.phone && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => window.location.href = `tel:${facility.phone}`}
              className="flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              <span>Call {facility.name}</span>
            </Button>
          )}

          <Button
            variant="secondary"
            fullWidth
            onClick={() => {/* Add message handler */}}
            className="flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Message</span>
          </Button>

          <Button
            variant="secondary"
            fullWidth
            onClick={() => window.open(`https://${facility.name.toLowerCase().replace(/\s+/g, '')}.com`, '_blank')}
            className="flex items-center justify-center gap-2"
          >
            <Globe className="w-5 h-5" />
            <span>Visit Website</span>
          </Button>
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
