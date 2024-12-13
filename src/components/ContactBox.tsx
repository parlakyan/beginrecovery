import { Building2, ShieldCheck, Phone, Globe, MessageCircle } from 'lucide-react';
import { Facility } from '../types';
import { Button } from './ui';
import ClaimButton from './ClaimButton';
import DisputeButton from './DisputeButton';

interface ContactBoxProps {
  facility: Facility;
}

/**
 * ContactBox component displays facility contact information and actions
 * Features vary based on verification status:
 * - Verified facilities: Show logo, call button, message button, website button, and status
 * - Unverified facilities: Show claim button and website button
 */
export default function ContactBox({ facility }: ContactBoxProps) {
  // Check if facility is owned by admin (claimable)
  const isAdminOwned = facility.ownerId === 'admin' || !facility.ownerId;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Logo Section - Only for verified facilities */}
      {facility.isVerified && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              {facility.logo ? (
                <img 
                  src={facility.logo} 
                  alt={`${facility.name} logo`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Building2 className="w-16 h-16 text-gray-400" />
              )}
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
        <div className="bg-surface rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Insurance Accepted</h4>
          <p className="text-gray-900">
            We work with most major insurance providers.{' '}
            <button 
              onClick={() => {/* Add insurance check handler */}} 
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Check insurance coverage
            </button>
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          {/* Claim Button - Show only for admin-owned facilities */}
          {isAdminOwned && facility.claimStatus === 'unclaimed' && (
            <ClaimButton 
              facilityId={facility.id}
              claimStatus={facility.claimStatus}
            />
          )}

          {/* Call and Message - Only for verified facilities */}
          {facility.isVerified && facility.phone && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => window.location.href = `tel:${facility.phone}`}
              className="flex items-center justify-center gap-2"
            >
              <Phone className="w-5 h-5" />
              <span>Call</span>
            </Button>
          )}

          {facility.isVerified && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {/* Add message handler */}}
              className="flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Message</span>
            </Button>
          )}

          {/* Website button shown for all facilities */}
          {facility.website && (
            <Button
              variant="secondary"
              fullWidth
              onClick={() => window.open(facility.website, '_blank')}
              className="flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" />
              <span>Visit Website</span>
            </Button>
          )}
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

        {/* Claim Status and Dispute Section */}
        {facility.claimStatus && (
          <div className="pt-6 border-t border-gray-200 space-y-4">
            {/* Status Display */}
            {facility.claimStatus === 'claimed' && (
              <div className="flex items-center gap-2 text-gray-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm">This facility has been claimed</span>
              </div>
            )}
            {facility.claimStatus === 'disputed' && (
              <div className="flex items-center gap-2 text-yellow-600">
                <ShieldCheck className="w-5 h-5" />
                <span className="text-sm">Ownership under review</span>
              </div>
            )}

            {/* Dispute Button - Show for claimed facilities */}
            {facility.claimStatus === 'claimed' && facility.activeClaimId && (
              <DisputeButton
                claimId={facility.activeClaimId}
                facilityName={facility.name}
                claimStatus={facility.claimStatus}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
