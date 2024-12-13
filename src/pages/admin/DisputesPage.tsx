import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { claimsService } from '../../services/claims';
import { useAuthStore } from '../../store/authStore';
import { FacilityClaim } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function DisputesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [disputes, setDisputes] = useState<FacilityClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');
  const [selectedDispute, setSelectedDispute] = useState<FacilityClaim | null>(null);

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch disputed claims
  useEffect(() => {
    const fetchDisputes = async () => {
      try {
        setLoading(true);
        const claims = await claimsService.getClaims('disputed');
        setDisputes(claims);
      } catch (err) {
        console.error('Error fetching disputes:', err);
        setError('Failed to load disputes');
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, []);

  const handleResolve = async (claim: FacilityClaim, resolution: 'approved' | 'rejected') => {
    try {
      await claimsService.resolveDispute(claim.id, user!.id, resolution, resolutionNotes);
      // Refresh disputes
      const updatedDisputes = await claimsService.getClaims('disputed');
      setDisputes(updatedDisputes);
      setSelectedDispute(null);
      setResolutionNotes('');
    } catch (err) {
      console.error('Error resolving dispute:', err);
      setError('Failed to resolve dispute');
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-yellow-600" />
            <h1 className="text-2xl font-bold">Disputed Claims</h1>
          </div>

          {/* Disputes List */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No disputed claims found
            </div>
          ) : (
            <div className="space-y-4">
              {disputes.map(dispute => (
                <div key={dispute.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{dispute.name}</h3>
                      <p className="text-gray-600">{dispute.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg">
                        <AlertTriangle className="w-4 h-4" />
                        Disputed
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <div>{dispute.email}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone</div>
                      <div>{dispute.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Website</div>
                      <div>{dispute.website}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Disputed On</div>
                      <div>{new Date(dispute.updatedAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Dispute Details */}
                  <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                    <div className="text-sm text-yellow-700 font-medium mb-1">Dispute Reason</div>
                    <p className="text-yellow-800">{dispute.disputeReason}</p>
                  </div>

                  {selectedDispute?.id === dispute.id ? (
                    <div className="space-y-4">
                      <textarea
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="Add resolution notes..."
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleResolve(dispute, 'approved')}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve Claim
                        </button>
                        <button
                          onClick={() => handleResolve(dispute, 'rejected')}
                          className="flex items-center gap-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject Claim
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDispute(null);
                            setResolutionNotes('');
                          }}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedDispute(dispute)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Resolve Dispute
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
