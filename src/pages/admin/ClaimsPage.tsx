import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { claimsService } from '../../services/claims';
import { useAuthStore } from '../../store/authStore';
import { FacilityClaim, ClaimStats } from '../../types';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ClaimsPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [claims, setClaims] = useState<FacilityClaim[]>([]);
  const [stats, setStats] = useState<ClaimStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'pending' | 'all'>('pending');

  // Check if user is admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch claims and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [claimsData, statsData] = await Promise.all([
          claimsService.getClaims(selectedStatus === 'all' ? undefined : 'pending'),
          claimsService.getClaimStats()
        ]);
        setClaims(claimsData);
        setStats(statsData);
      } catch (err) {
        console.error('Error fetching claims:', err);
        setError('Failed to load claims');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedStatus]);

  const handleApprove = async (claim: FacilityClaim) => {
    try {
      await claimsService.updateClaimStatus(claim.id, 'approved', user!.id);
      // Refresh claims
      const updatedClaims = await claimsService.getClaims(selectedStatus === 'all' ? undefined : 'pending');
      setClaims(updatedClaims);
    } catch (err) {
      console.error('Error approving claim:', err);
      setError('Failed to approve claim');
    }
  };

  const handleReject = async (claim: FacilityClaim) => {
    try {
      await claimsService.updateClaimStatus(claim.id, 'rejected', user!.id);
      // Refresh claims
      const updatedClaims = await claimsService.getClaims(selectedStatus === 'all' ? undefined : 'pending');
      setClaims(updatedClaims);
    } catch (err) {
      console.error('Error rejecting claim:', err);
      setError('Failed to reject claim');
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
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold">Facility Claims</h1>
          </div>

          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 mb-1">Pending Claims</div>
                <div className="text-2xl font-bold">{stats.pendingClaims}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 mb-1">Auto-Approved</div>
                <div className="text-2xl font-bold">{stats.autoApproved}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600 mb-1">Manually Approved</div>
                <div className="text-2xl font-bold">{stats.manuallyApproved}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-sm text-red-600 mb-1">Rejected Claims</div>
                <div className="text-2xl font-bold">{stats.rejectedClaims}</div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setSelectedStatus('pending')}
              className={`px-4 py-2 rounded-lg ${
                selectedStatus === 'pending'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending Claims
            </button>
            <button
              onClick={() => setSelectedStatus('all')}
              className={`px-4 py-2 rounded-lg ${
                selectedStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Claims
            </button>
          </div>

          {/* Claims List */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
          ) : claims.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No claims found
            </div>
          ) : (
            <div className="space-y-4">
              {claims.map(claim => (
                <div key={claim.id} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{claim.name}</h3>
                      <p className="text-gray-600">{claim.position}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {claim.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(claim)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(claim)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </>
                      )}
                      {claim.status === 'approved' && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          Approved
                        </span>
                      )}
                      {claim.status === 'rejected' && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg">
                          <XCircle className="w-4 h-4" />
                          Rejected
                        </span>
                      )}
                      {claim.status === 'disputed' && (
                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg">
                          <AlertTriangle className="w-4 h-4" />
                          Disputed
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Email</div>
                      <div className="flex items-center gap-2">
                        {claim.email}
                        {claim.emailMatchesDomain && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Domain Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Phone</div>
                      <div>{claim.phone}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Website</div>
                      <div>{claim.website}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Submitted</div>
                      <div>{new Date(claim.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {claim.adminNotes && (
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">Admin Notes</div>
                      <div>{claim.adminNotes}</div>
                    </div>
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
