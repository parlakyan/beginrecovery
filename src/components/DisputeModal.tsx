import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { claimsService } from '../services/claims';
import { useAuthStore } from '../store/authStore';

interface DisputeModalProps {
  claimId: string;
  facilityName: string;
  onClose: () => void;
}

export default function DisputeModal({ claimId, facilityName, onClose }: DisputeModalProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await claimsService.disputeClaim(claimId, user.id, reason);
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting dispute:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-semibold">Dispute Facility Claim</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="text-yellow-600 font-semibold mb-2">
                Dispute Submitted Successfully
              </div>
              <p className="text-gray-600 mb-6">
                Our team will review your dispute and take appropriate action. We'll notify you once a decision has been made.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                <p>You are disputing the ownership claim for <strong>{facilityName}</strong>.</p>
                <p className="text-sm mt-1">Please provide detailed information to support your dispute.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Dispute
                </label>
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none min-h-[120px]"
                  placeholder="Explain why you believe this claim should be reviewed..."
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include any relevant details about your connection to the facility and why you believe the current claim is incorrect.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Submitting...' : 'Submit Dispute'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
