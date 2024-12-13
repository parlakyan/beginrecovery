import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import ClaimModal from './ClaimModal';  // Fixed import path

interface ClaimButtonProps {
  facilityId: string;
  claimStatus?: 'unclaimed' | 'claimed' | 'disputed';
}

/**
 * Button component for claiming facility listings
 * Shows different states based on claim status and user authentication
 */
export default function ClaimButton({ facilityId, claimStatus = 'unclaimed' }: ClaimButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  // Don't show button if facility is already claimed
  if (claimStatus === 'claimed') {
    return null;
  }

  // Show disputed status if applicable
  if (claimStatus === 'disputed') {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
        <Shield className="w-5 h-5" />
        <span>Ownership Disputed</span>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <button
        onClick={() => window.location.href = '/login?redirect=' + window.location.pathname}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Shield className="w-5 h-5" />
        <span>Login to Claim This Listing</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Shield className="w-5 h-5" />
        <span>Claim This Listing</span>
      </button>

      {showModal && (
        <ClaimModal
          facilityId={facilityId}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
