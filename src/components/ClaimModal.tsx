import React, { useState } from 'react';
import { X } from 'lucide-react';
import { claimsService } from '../services/claims';
import { useAuthStore } from '../store/authStore';
import { ClaimFormData } from '../types';

interface ClaimModalProps {
  facilityId: string;
  onClose: () => void;
}

export default function ClaimModal({ facilityId, onClose }: ClaimModalProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<ClaimFormData>({
    name: '',
    position: '',
    website: '',
    email: '',
    phone: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      await claimsService.createClaim(facilityId, user.id, formData);
      setSuccess(true);
    } catch (err) {
      console.error('Error submitting claim:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[60]">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[calc(100vh-100px)] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Claim This Listing</h2>
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
              <div className="text-green-600 font-semibold mb-2">
                Claim Submitted Successfully
              </div>
              <p className="text-gray-600 mb-6">
                {formData.email.split('@')[1] === new URL(formData.website).hostname.replace('www.', '') 
                  ? 'Your email matches the facility domain. Your claim has been automatically approved.'
                  : 'Your claim will be reviewed by our team. We\'ll notify you once it\'s approved.'}
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Position at Facility
                </label>
                <input
                  type="text"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g. Director, Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Website
                </label>
                <input
                  type="url"
                  required
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://example.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter the official facility website
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="you@facility.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Using your facility email address will speed up verification
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="(123) 456-7890"
                />
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
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Submitting...' : 'Submit Claim'}
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
