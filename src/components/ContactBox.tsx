import React from 'react';
import { Phone, Mail, Globe, MessageCircle, ShieldCheck } from 'lucide-react';
import { Facility } from '../types';
import { Button } from './ui';

interface ContactBoxProps {
  facility: Facility;
}

export default function ContactBox({ facility }: ContactBoxProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Logo/Image */}
      <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
        {facility.logo ? (
          <img 
            src={facility.logo} 
            alt={`${facility.name} logo`}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-sm">No logo available</span>
          </div>
        )}
      </div>

      {/* Verification Status */}
      {facility.isVerified && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg">
          <ShieldCheck className="w-5 h-5" />
          <div>
            <div className="font-medium">Facility Status</div>
            <div className="text-sm">Currently accepting patients</div>
          </div>
        </div>
      )}

      {/* Contact Actions */}
      {facility.isVerified ? (
        <div className="space-y-3">
          {facility.phone && (
            <Button
              variant="primary"
              className="w-full justify-center gap-2"
              onClick={() => window.location.href = `tel:${facility.phone}`}
            >
              <Phone className="w-4 h-4" />
              Call Now
            </Button>
          )}
          
          <Button
            variant="secondary"
            className="w-full justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4" />
            Message
          </Button>

          {facility.email && (
            <Button
              variant="secondary"
              className="w-full justify-center gap-2"
              onClick={() => window.location.href = `mailto:${facility.email}`}
            >
              <Mail className="w-4 h-4" />
              Email
            </Button>
          )}

          <Button
            variant="secondary"
            className="w-full justify-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Visit Website
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Button
            variant="secondary"
            className="w-full justify-center"
            disabled
          >
            Contact information unavailable
          </Button>
          <p className="text-sm text-gray-500 text-center">
            This facility has not been verified
          </p>
        </div>
      )}

      {/* Insurance Info */}
      {facility.insurance && facility.insurance.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Insurance Accepted</h3>
          <div className="text-sm text-gray-600">
            We work with most major insurance providers.{' '}
            <button className="text-blue-600 hover:text-blue-700">
              Check insurance coverage
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
