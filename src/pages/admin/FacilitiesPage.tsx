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
  ExternalLink,
  Box,
  CheckSquare,
  Square
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { facilitiesService } from '../../services/facilities';
import { Facility } from '../../types';
import EditListingModal from '../../components/EditListingModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import DropdownSelect from '../../components/ui/DropdownSelect';
import Pagination from '../../components/ui/Pagination';
import { Button } from '../../components/ui';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'text-green-600 bg-green-50 border-green-200';
    case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
    case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export default function FacilitiesPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [archivedFacilities, setArchivedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Batch selection state
  const [selectedFacilities, setSelectedFacilities] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // Batch action confirmation dialogs
  const [batchArchiveDialog, setBatchArchiveDialog] = useState(false);
  const [batchDeleteDialog, setBatchDeleteDialog] = useState(false);
  const [batchVerifyDialog, setBatchVerifyDialog] = useState(false);
  const [batchUnverifyDialog, setBatchUnverifyDialog] = useState(false);

  // Individual action dialogs
  const [archiveDialog, setArchiveDialog] = useState<{ isOpen: boolean; facilityId: string | null }>({
    isOpen: false,
    facilityId: null
  });
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; facilityId: string | null }>({
    isOpen: false,
    facilityId: null
  });

  // Fetch facilities
  const fetchData = async () => {
    try {
      setLoading(true);
      const [allListings, archived] = await Promise.all([
        facilitiesService.getAllListingsForAdmin(),
        facilitiesService.getArchivedListings()
      ]);
      setFacilities(allListings);
      setArchivedFacilities(archived);
      // Reset selection when data changes
      setSelectedFacilities(new Set());
      setSelectAll(false);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Individual action handlers
  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
  };

  const handleSave = async (data: Partial<Facility>) => {
    if (!editingFacility) return;
    try {
      setLoading(true);
      await facilitiesService.updateFacility(editingFacility.id, data);
      await fetchData();
      setEditingFacility(null);
    } catch (error) {
      console.error('Error updating facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      await facilitiesService.approveFacility(id);
      await fetchData();
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
      await fetchData();
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
      await fetchData();
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
      await fetchData();
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
      await fetchData();
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
      await fetchData();
      setDeleteDialog({ isOpen: false, facilityId: null });
    } catch (error) {
      console.error('Error deleting facility:', error);
    } finally {
      setLoading(false);
    }
  };

  // Batch action handlers
  const handleBatchArchive = async () => {
    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedFacilities).map(id => facilitiesService.archiveFacility(id))
      );
      await fetchData();
      setBatchArchiveDialog(false);
    } catch (error) {
      console.error('Error batch archiving facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedFacilities).map(id => facilitiesService.deleteFacility(id))
      );
      await fetchData();
      setBatchDeleteDialog(false);
    } catch (error) {
      console.error('Error batch deleting facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchVerify = async (verify: boolean) => {
    try {
      setLoading(true);
      await Promise.all(
        Array.from(selectedFacilities).map(id => 
          verify 
            ? facilitiesService.verifyFacility(id)
            : facilitiesService.unverifyFacility(id)
        )
      );
      await fetchData();
      setBatchVerifyDialog(false);
      setBatchUnverifyDialog(false);
    } catch (error) {
      console.error('Error batch verifying facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Batch selection handlers
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedFacilities(new Set());
    } else {
      setSelectedFacilities(new Set(paginatedFacilities.map(f => f.id)));
    }
    setSelectAll(!selectAll);
  };

  const handleSelectFacility = (facilityId: string) => {
    const newSelected = new Set(selectedFacilities);
    if (newSelected.has(facilityId)) {
      newSelected.delete(facilityId);
    } else {
      newSelected.add(facilityId);
    }
    setSelectedFacilities(newSelected);
    setSelectAll(newSelected.size === paginatedFacilities.length);
  };

  // Filter facilities based on search and filters
  const filteredFacilities = (showArchived ? archivedFacilities : facilities).filter((facility: Facility) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      facility.name.toLowerCase().includes(searchLower) ||
      (facility.location || '').toLowerCase().includes(searchLower) ||
      (facility.email || '').toLowerCase().includes(searchLower) ||
      (facility.phone || '').toLowerCase().includes(searchLower) ||
      (facility.city || '').toLowerCase().includes(searchLower) ||
      (facility.state || '').toLowerCase().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || facility.moderationStatus === statusFilter;
    
    const matchesVerification = verificationFilter === 'all' || 
      (verificationFilter === 'verified' && facility.isVerified) ||
      (verificationFilter === 'unverified' && !facility.isVerified);

    return matchesSearch && matchesStatus && matchesVerification;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredFacilities.length / pageSize);
  const paginatedFacilities = filteredFacilities.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
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

        {/* View Toggle */}
        <button
          onClick={() => {
            setShowArchived(!showArchived);
            setSelectedFacilities(new Set());
            setSelectAll(false);
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
            showArchived 
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          {showArchived ? (
            <>
              <Box className="w-4 h-4" />
              View Active Listings
            </>
          ) : (
            <>
              <Archive className="w-4 h-4" />
              View Archived Listings
            </>
          )}
        </button>

        {/* Filters */}
        {!showArchived && (
          <div className="flex gap-4">
            <select
              className="px-4 py-2 border rounded-lg"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="all">All Verification</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        )}
      </div>

      {/* Batch Actions */}
      {selectedFacilities.size > 0 && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
          <span className="text-blue-700 font-medium">
            {selectedFacilities.size} {selectedFacilities.size === 1 ? 'facility' : 'facilities'} selected
          </span>
          <div className="flex gap-2">
            {!showArchived && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => setBatchVerifyDialog(true)}
                  className="text-sm"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Verify
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setBatchUnverifyDialog(true)}
                  className="text-sm"
                >
                  <ShieldAlert className="w-4 h-4" />
                  Unverify
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setBatchArchiveDialog(true)}
                  className="text-sm"
                >
                  <Archive className="w-4 h-4" />
                  Archive
                </Button>
              </>
            )}
            {showArchived && (
              <Button
                variant="secondary"
                onClick={() => setBatchDeleteDialog(true)}
                className="text-sm bg-red-50 text-red-700 hover:bg-red-100"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="bg-white">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Facilities Found</h2>
            <p className="text-gray-600">
              {showArchived 
                ? 'No archived facilities match your search.'
                : 'No facilities match your current filters.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-4 px-4">
                    <button
                      onClick={handleSelectAll}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      {selectAll ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold">Facility</th>
                  <th className="text-left py-4 px-4 font-semibold">Location</th>
                  <th className="text-left py-4 px-4 font-semibold">Status</th>
                  <th className="text-left py-4 px-4 font-semibold">Verification</th>
                  <th className="text-left py-4 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedFacilities.map((facility) => (
                  <tr key={facility.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleSelectFacility(facility.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {selectedFacilities.has(facility.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    </td>
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
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(facility.moderationStatus || '')}`}>
                        {(facility.moderationStatus || '').charAt(0).toUpperCase() + (facility.moderationStatus || '').slice(1)}
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

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
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

      {/* Individual Action Confirmation Dialogs */}
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

      {/* Batch Action Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={batchArchiveDialog}
        onClose={() => setBatchArchiveDialog(false)}
        onConfirm={handleBatchArchive}
        title="Archive Facilities"
        message={`Are you sure you want to archive ${selectedFacilities.size} facilities? They will be moved to the archived section.`}
        type="warning"
      />

      <ConfirmationDialog
        isOpen={batchDeleteDialog}
        onClose={() => setBatchDeleteDialog(false)}
        onConfirm={handleBatchDelete}
        title="Delete Facilities"
        message={`Are you sure you want to permanently delete ${selectedFacilities.size} facilities? This action cannot be undone.`}
        type="danger"
      />

      <ConfirmationDialog
        isOpen={batchVerifyDialog}
        onClose={() => setBatchVerifyDialog(false)}
        onConfirm={() => handleBatchVerify(true)}
        title="Verify Facilities"
        message={`Are you sure you want to verify ${selectedFacilities.size} facilities?`}
        type="warning"
      />

      <ConfirmationDialog
        isOpen={batchUnverifyDialog}
        onClose={() => setBatchUnverifyDialog(false)}
        onConfirm={() => handleBatchVerify(false)}
        title="Remove Verification"
        message={`Are you sure you want to remove verification from ${selectedFacilities.size} facilities?`}
        type="warning"
      />
    </div>
  );
}
