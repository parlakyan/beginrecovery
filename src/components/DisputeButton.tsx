import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import DisputeModal from './DisputeModal';

interface DisputeButtonProps {
  claimId: string;
  facilityName: string;
  claimStatus?: 'unclaimed' | 'claimed' | 'disputed';
}

/**
 * Button component for disputing facility claims
 * Shows different states based on claim status and user authentication
 */
export default function DisputeButton({ claimId, facilityName, claimStatus = 'claimed' }: DisputeButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuthStore();

  // Don't show button if facility is unclaimed or already disputed
  if (claimStatus === 'unclaimed' || claimStatus === 'disputed') {
    return null;
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <button
        onClick={() => window.location.href = '/login?redirect=' + window.location.pathname}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
      >
        <AlertTriangle className="w-5 h-5" />
        <span>Login to Dispute This Claim</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
      >
        <AlertTriangle className="w-5 h-5" />
        <span>Dispute This Claim</span>
      </button>

      {showModal && (
        <DisputeModal
          claimId={claimId}
          facilityName={facilityName}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
