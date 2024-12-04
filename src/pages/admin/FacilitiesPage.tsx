import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Edit2, 
  Archive, 
  Trash2, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Star,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { facilitiesService } from '../../services/facilities';
import { Facility } from '../../types';
import EditListingModal from '../../components/EditListingModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import DropdownSelect from '../../components/ui/DropdownSelect';

export default function FacilitiesPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  // Confirmation dialogs
  const [archiveDialog, setArchiveDialog] = useState<{ isOpen: boolean; facilityId: string | null }>({
    isOpen: false,
    facilityId: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; facilityId: string | null }>({
    isOpen: false,
    facilityId: null
  });

  // Fetch facilities
  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const allListings = await facilitiesService.getAllListingsForAdmin();
      setFacilities(allListings);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  // Filter facilities based on search and filters
  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || facility.moderationStatus === statusFilter;
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && facility.isVerified) ||
      (verificationFilter === 'unverified' && !facility.isVerified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
  };

  const handleSave = async (data: Partial<Facility>) => {
    if (!editingFacility) return;
    try {
      await facilitiesService.updateFacility(editingFacility.id, data);
      await fetchFacilities();
      setEditingFacility(null);
    } catch (error) {
      console.error('Error updating facility:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      await facilitiesService.approveFacility(id);
      await fetchFacilities();
    } catch (error) {
      console.error('Error approving facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      await facilitiesService.rejectFacility(id);
      await fetchFacilities();
    } catch (error) {
      console.error('Error rejecting facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationToggle = async (id: string, isVerified: boolean) => {
    try {
      setLoading(true);
      if (isVerified) {
        await facilitiesService.unverifyFacility(id);
      } else {
        await facilitiesService.verifyFacility(id);
      }
      await fetchFacilities();
    } catch (error) {
      console.error('Error toggling verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    try {
      setLoading(true);
      if (isFeatured) {
        await facilitiesService.unfeatureFacility(id);
      } else {
        await facilitiesService.featureFacility(id);
      }
      await fetchFacilities();
    } catch (error) {
      console.error('Error featuring/unfeaturing facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      setLoading(true);
      await facilitiesService.archiveFacility(id);
      await fetchFacilities();
      setArchiveDialog({ isOpen: false, facilityId: null });
    } catch (error) {
      console.error('Error archiving facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await facilitiesService.deleteFacility(id);
      await fetchFacilities();
      setDeleteDialog({ isOpen: false, facilityId: null });
    } catch (error) {
      console.error('Error deleting facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Search */}
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search facilities..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-300 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="w-48">
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Verification Filter */}
        <div className="w-48">
          <select
            className="w-full px-4 py-2 border rounded-lg"
            value={verificationFilter}
            onChange={(e) => setVerificationFilter(e.target.value)}
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Facilities Found</h2>
            <p className="text-gray-600">
              No facilities match your current filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Facility</th>
                  <th className="text-left py-4 px-4 font-semibold">Location</th>
                  <th className="text-left py-4 px-4 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 font-semibold">Verification</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacilities.map((facility) => (
                  <tr key={facility.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium flex items-center gap-2">
                        {facility.name}
                        <a 
                          href={`/${facility.slug}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700"
                          title="Open in new tab"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                      <div className="text-sm text-gray-500">{facility.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-gray-600">{facility.location}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(facility.moderationStatus)}`}>
                        {facility.moderationStatus.charAt(0).toUpperCase() + facility.moderationStatus.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${facility.isVerified ? 'text-green-600 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-50 border-gray-200'}`}>
                        {facility.isVerified ? (
                          <>
                            <ShieldCheck className="w-4 h-4" />
                            Verified
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-4 h-4" />
                            Unverified
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        {/* Approval/Rejection buttons - only show for pending facilities */}
                        {facility.moderationStatus === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(facility.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded" 
                              title="Approve Listing"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleReject(facility.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded" 
                              title="Reject Listing"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* Verification toggle */}
                        <button 
                          onClick={() => handleVerificationToggle(facility.id, facility.isVerified)}
                          className={`p-1 rounded ${
                            facility.isVerified 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-gray-400 hover:bg-gray-50'
                          }`}
                          title={facility.isVerified ? "Remove Verification" : "Verify Listing"}
                        >
                          {facility.isVerified ? (
                            <ShieldCheck className="w-5 h-5" />
                          ) : (
                            <ShieldAlert className="w-5 h-5" />
                          )}
                        </button>

                        {/* Feature toggle - only show for approved facilities */}
                        {facility.moderationStatus === 'approved' && (
                          <button 
                            onClick={() => handleFeature(facility.id, facility.isFeatured)}
                            className={`p-1 rounded ${
                              facility.isFeatured 
                                ? 'text-yellow-500 hover:bg-yellow-50' 
                                : 'text-gray-400 hover:bg-gray-50'
                            }`}
                            title={facility.isFeatured ? "Unfeature" : "Feature"}
                          >
                            <Star className="w-5 h-5" fill={facility.isFeatured ? "currentColor" : "none"} />
                          </button>
                        )}

                        {/* Edit button */}
                        <button 
                          onClick={() => handleEdit(facility)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>

                        {/* Archive/Delete buttons */}
                        {facility.moderationStatus !== 'archived' ? (
                          <button 
                            onClick={() => setArchiveDialog({ isOpen: true, facilityId: facility.id })}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded" 
                            title="Archive"
                          >
                            <Archive className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            onClick={() => setDeleteDialog({ isOpen: true, facilityId: facility.id })}
                            className="p-1 text-red-600 hover:bg-red-50 rounded" 
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingFacility && (
        <EditListingModal
          facility={editingFacility}
          isOpen={true}
          onClose={() => setEditingFacility(null)}
          onSave={handleSave}
        />
      )}

      {/* Archive Confirmation */}
      <ConfirmationDialog
        isOpen={archiveDialog.isOpen}
        onClose={() => setArchiveDialog({ isOpen: false, facilityId: null })}
        onConfirm={() => {
          if (archiveDialog.facilityId) {
            handleArchive(archiveDialog.facilityId);
          }
        }}
        title="Archive Facility"
        message="Are you sure you want to archive this facility? It will be moved to the archived section."
        type="warning"
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, facilityId: null })}
        onConfirm={() => {
          if (deleteDialog.facilityId) {
            handleDelete(deleteDialog.facilityId);
          }
        }}
        title="Delete Facility"
        message="Are you sure you want to permanently delete this facility? This action cannot be undone."
        type="danger"
      />
    </div>
  );
}
