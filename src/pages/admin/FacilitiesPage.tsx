import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { facilitiesService } from '../../services/facilities';
import { Facility } from '../../types';
import { FacilityTable } from '../../components/FacilityTable';
import { FacilityFilters } from '../../components/FacilityFilters';
import { BatchActions } from '../../components/BatchActions';
import EditListingModal from '../../components/EditListingModal';
import ConfirmationDialog from '../../components/ConfirmationDialog';
import Pagination from '../../components/ui/Pagination';

export default function FacilitiesPage(): JSX.Element {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [archivedFacilities, setArchivedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
  const [restoreDialog, setRestoreDialog] = useState<{ isOpen: boolean; facilityId: string | null }>({
    isOpen: false,
    facilityId: null
  });
  const [revertDialog, setRevertDialog] = useState<{ isOpen: boolean; facilityId: string | null }>({
    isOpen: false,
    facilityId: null
  });

  // Check authentication and admin role
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Fetch facilities with cleanup
  const fetchData = async (signal?: AbortSignal) => {
    if (signal?.aborted) return;
    
    try {
      setLoading(true);
      setError(null);
      const [allListings, archived] = await Promise.all([
        facilitiesService.getAllListingsForAdmin(),
        facilitiesService.getArchivedListings()
      ]);
      
      if (signal?.aborted) return;
      
      setFacilities(allListings || []);
      setArchivedFacilities(archived || []);
      // Reset selection when data changes
      setSelectedFacilities(new Set());
      setSelectAll(false);
    } catch (error) {
      if (signal?.aborted) return;
      
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while fetching facilities');
      }
      console.error('Error fetching facilities:', error);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    
    // Use an async IIFE to handle the Promise
    (async () => {
      try {
        await fetchData(controller.signal);
      } catch (error) {
        // Error handling is already done in fetchData
      }
    })();
    
    return () => {
      controller.abort();
    };
  }, []);

  // Individual action handlers
  const handleEdit = (facility: Facility) => {
    setEditingFacility(facility);
  };

  const handleSave = async (data: Partial<Facility>) => {
    if (!editingFacility) return;
    try {
      setLoading(true);
      setError(null);
      
      // Call update and await it without checking return value
      await facilitiesService.updateFacility(editingFacility.id, data);
      
      // Update local state optimistically
      const updatedFacility = { ...editingFacility, ...data } as Facility;
      setFacilities(prevFacilities => 
        prevFacilities.map(facility => 
          facility.id === editingFacility.id ? updatedFacility : facility
        )
      );
      
      setEditingFacility(null);
      
      // Refresh data to ensure consistency
      await fetchData();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating the facility');
      }
      console.error('Error updating facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await facilitiesService.archiveFacility(id);
      if (!result) {
        throw new Error('Failed to archive facility');
      }
      void fetchData();
      setArchiveDialog({ isOpen: false, facilityId: null });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while archiving the facility');
      }
      console.error('Error archiving facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await facilitiesService.deleteFacility(id);
      void fetchData();
      setDeleteDialog({ isOpen: false, facilityId: null });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while deleting the facility');
      }
      console.error('Error deleting facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await facilitiesService.restoreFacility(id);
      if (!result) {
        throw new Error('Failed to restore facility');
      }
      void fetchData();
      setRestoreDialog({ isOpen: false, facilityId: null });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while restoring the facility');
      }
      console.error('Error restoring facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevertToPending = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await facilitiesService.revertToPending(id);
      if (!result) {
        throw new Error('Failed to revert facility');
      }
      void fetchData();
      setRevertDialog({ isOpen: false, facilityId: null });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while reverting the facility');
      }
      console.error('Error reverting facility to pending:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await facilitiesService.approveFacility(id);
      if (!result) {
        throw new Error('Failed to approve facility');
      }
      void fetchData();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while approving the facility');
      }
      console.error('Error approving facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await facilitiesService.rejectFacility(id);
      if (!result) {
        throw new Error('Failed to reject facility');
      }
      void fetchData();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while rejecting the facility');
      }
      console.error('Error rejecting facility:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationToggle = async (id: string, isVerified: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const result = isVerified
        ? await facilitiesService.unverifyFacility(id)
        : await facilitiesService.verifyFacility(id);
      if (!result) {
        throw new Error('Failed to update verification status');
      }
      void fetchData();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating verification status');
      }
      console.error('Error toggling verification:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeatureToggle = async (id: string, isFeatured: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const result = isFeatured
        ? await facilitiesService.unfeatureFacility(id)
        : await facilitiesService.featureFacility(id);
      if (!result) {
        throw new Error('Failed to update feature status');
      }
      void fetchData();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while updating feature status');
      }
      console.error('Error featuring/unfeaturing facility:', error);
    } finally {
      setLoading(false);
    }
  };

  // Batch action handlers
  const handleBatchArchive = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.all(
        Array.from(selectedFacilities).map(id => facilitiesService.archiveFacility(id))
      );
      if (results.some(result => !result)) {
        throw new Error('Failed to archive some facilities');
      }
      void fetchData();
      setBatchArchiveDialog(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while batch archiving facilities');
      }
      console.error('Error batch archiving facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all(
        Array.from(selectedFacilities).map(id => facilitiesService.deleteFacility(id))
      );
      void fetchData();
      setBatchDeleteDialog(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while batch deleting facilities');
      }
      console.error('Error batch deleting facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchVerify = async (verify: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const results = await Promise.all(
        Array.from(selectedFacilities).map(id => 
          verify 
            ? facilitiesService.verifyFacility(id)
            : facilitiesService.unverifyFacility(id)
        )
      );
      if (results.some(result => !result)) {
        throw new Error('Failed to update verification status for some facilities');
      }
      void fetchData();
      setBatchVerifyDialog(false);
      setBatchUnverifyDialog(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while batch verifying facilities');
      }
      console.error('Error batch verifying facilities:', error);
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
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

  // If not authenticated or not admin, return loading state
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <FacilityFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        verificationFilter={verificationFilter}
        onVerificationFilterChange={setVerificationFilter}
        showArchived={showArchived}
        onArchivedToggle={() => {
          setShowArchived(!showArchived);
          setSelectedFacilities(new Set());
          setSelectAll(false);
          setCurrentPage(1);
        }}
      />

      <BatchActions
        selectedCount={selectedFacilities.size}
        showArchived={showArchived}
        onVerify={() => setBatchVerifyDialog(true)}
        onUnverify={() => setBatchUnverifyDialog(true)}
        onArchive={() => setBatchArchiveDialog(true)}
        onDelete={() => setBatchDeleteDialog(true)}
      />

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
            <FacilityTable
              facilities={paginatedFacilities}
              selectedFacilities={selectedFacilities}
              selectAll={selectAll}
              onSelectAll={handleSelectAll}
              onSelectFacility={handleSelectFacility}
              onEdit={handleEdit}
              onArchive={(id) => setArchiveDialog({ isOpen: true, facilityId: id })}
              onDelete={(id) => setDeleteDialog({ isOpen: true, facilityId: id })}
              onRestore={(id) => setRestoreDialog({ isOpen: true, facilityId: id })}
              onRevertToPending={(id) => setRevertDialog({ isOpen: true, facilityId: id })}
              onApprove={handleApprove}
              onReject={handleReject}
              onVerificationToggle={handleVerificationToggle}
              onFeatureToggle={handleFeatureToggle}
            />

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

      {editingFacility && (
        <EditListingModal
          facility={editingFacility}
          isOpen={true}
          onClose={() => setEditingFacility(null)}
          onSave={handleSave}
        />
      )}

      {/* Confirmation Dialogs */}
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

      <ConfirmationDialog
        isOpen={restoreDialog.isOpen}
        onClose={() => setRestoreDialog({ isOpen: false, facilityId: null })}
        onConfirm={() => {
          if (restoreDialog.facilityId) {
            handleRestore(restoreDialog.facilityId);
          }
        }}
        title="Restore Facility"
        message="Are you sure you want to restore this facility? It will be moved back to pending status."
        type="warning"
      />

      <ConfirmationDialog
        isOpen={revertDialog.isOpen}
        onClose={() => setRevertDialog({ isOpen: false, facilityId: null })}
        onConfirm={() => {
          if (revertDialog.facilityId) {
            handleRevertToPending(revertDialog.facilityId);
          }
        }}
        title="Revert to Pending"
        message="Are you sure you want to revert this facility to pending status? This will require re-approval."
        type="warning"
      />

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
