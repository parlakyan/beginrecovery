import { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Archive, 
  Plus, 
  CheckCircle, 
  XCircle, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Facility } from '../types';
import { facilitiesService } from '../services/firebase';
import useAuthStore from '../store/authStore';
import EditListingModal from '../components/EditListingModal';
import ConfirmationDialog from '../components/ConfirmationDialog';

export default function AdminDashboard() {
  const user = useAuthStore(state => state.user);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [archivedFacilities, setArchivedFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const [active, archived] = await Promise.all([
        facilitiesService.getAllListingsForAdmin(),
        facilitiesService.getArchivedListings()
      ]);
      setFacilities(active);
      setArchivedFacilities(archived);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      setError('Error loading facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (facility: Facility, action: 'approve' | 'reject' | 'archive') => {
    try {
      switch (action) {
        case 'approve':
          await facilitiesService.approveFacility(facility.id);
          break;
        case 'reject':
          await facilitiesService.rejectFacility(facility.id);
          break;
        case 'archive':
          await facilitiesService.archiveFacility(facility.id);
          break;
      }
      await fetchFacilities();
    } catch (error) {
      console.error('Error updating facility:', error);
      setError('Error updating facility');
    }
  };

  const handleEdit = (facility: Facility) => {
    setSelectedFacility(facility);
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!selectedFacility) return;
    try {
      await facilitiesService.deleteFacility(selectedFacility.id);
      setShowDeleteDialog(false);
      setSelectedFacility(null);
      await fetchFacilities();
    } catch (error) {
      console.error('Error deleting facility:', error);
      setError('Error deleting facility');
    }
  };

  const handleArchive = async () => {
    if (!selectedFacility) return;
    try {
      await handleStatusChange(selectedFacility, 'archive');
      setShowArchiveDialog(false);
      setSelectedFacility(null);
    } catch (error) {
      console.error('Error archiving facility:', error);
      setError('Error archiving facility');
    }
  };

  const displayedFacilities = showArchived ? archivedFacilities : facilities;

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Access Denied</h3>
          <p className="mt-1 text-sm text-gray-500">You do not have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                showArchived
                  ? 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-50'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showArchived ? <LayoutGrid className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
              {showArchived ? 'Show Active' : 'Show Archived'}
            </button>
            <button
              onClick={() => {}}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : displayedFacilities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No facilities found.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {displayedFacilities.map((facility) => (
                <li key={facility.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">{facility.name}</h3>
                        <p className="mt-1 text-sm text-gray-500">{facility.location}</p>
                      </div>
                      <div className="flex gap-2">
                        {!showArchived && (
                          <>
                            <button
                              onClick={() => handleStatusChange(facility, 'approve')}
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(facility, 'reject')}
                              className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(facility)}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {!showArchived && (
                          <button
                            onClick={() => {
                              setSelectedFacility(facility);
                              setShowArchiveDialog(true);
                            }}
                            className="inline-flex items-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Archive className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedFacility(facility);
                            setShowDeleteDialog(true);
                          }}
                          className="inline-flex items-center p-2 border border-gray-300 rounded-full shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {selectedFacility && (
        <EditListingModal
          isOpen={showEditModal}
          facility={selectedFacility}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFacility(null);
          }}
          onSave={async (updatedFacility) => {
            try {
              await facilitiesService.updateFacility(selectedFacility.id, updatedFacility);
              setShowEditModal(false);
              setSelectedFacility(null);
              await fetchFacilities();
            } catch (error) {
              console.error('Error updating facility:', error);
              setError('Error updating facility');
            }
          }}
        />
      )}

      <ConfirmationDialog
        isOpen={showDeleteDialog}
        title="Delete Facility"
        message="Are you sure you want to delete this facility? This action cannot be undone."
        confirmLabel="Delete"
        confirmStyle="danger"
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedFacility(null);
        }}
      />

      <ConfirmationDialog
        isOpen={showArchiveDialog}
        title="Archive Facility"
        message="Are you sure you want to archive this facility? It will no longer be visible to users."
        confirmLabel="Archive"
        confirmStyle="warning"
        onConfirm={handleArchive}
        onCancel={() => {
          setShowArchiveDialog(false);
          setSelectedFacility(null);
        }}
      />
    </div>
  );
}
