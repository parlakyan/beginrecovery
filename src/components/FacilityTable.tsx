import React from 'react';
import { 
  Edit2, 
  Archive, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Star,
  ExternalLink,
  CheckSquare,
  Square,
  RotateCcw,
  History
} from 'lucide-react';
import { Facility } from '../types';

interface FacilityTableProps {
  facilities: Facility[];
  selectedFacilities: Set<string>;
  selectAll: boolean;
  onSelectAll: () => void;
  onSelectFacility: (id: string) => void;
  onEdit: (facility: Facility) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onRevertToPending: (id: string) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onVerificationToggle: (id: string, isVerified: boolean) => void;
  onFeatureToggle: (id: string, isFeatured: boolean) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'text-green-600 bg-green-50 border-green-200';
    case 'pending': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
    case 'archived': return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
};

export const FacilityTable: React.FC<FacilityTableProps> = ({
  facilities,
  selectedFacilities,
  selectAll,
  onSelectAll,
  onSelectFacility,
  onEdit,
  onArchive,
  onDelete,
  onRestore,
  onRevertToPending,
  onApprove,
  onReject,
  onVerificationToggle,
  onFeatureToggle
}) => {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="py-4 px-4">
            <button
              onClick={onSelectAll}
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
        {facilities.map((facility) => (
          <tr key={facility.id} className="border-b hover:bg-gray-50">
            <td className="py-4 px-4">
              <button
                onClick={() => onSelectFacility(facility.id)}
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
                {/* Show restore button for archived facilities */}
                {facility.moderationStatus === 'archived' && (
                  <button 
                    onClick={() => onRestore(facility.id)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                    title="Restore Listing"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}

                {/* Show revert to pending button for approved facilities */}
                {facility.moderationStatus === 'approved' && (
                  <button 
                    onClick={() => onRevertToPending(facility.id)}
                    className="p-1 text-yellow-600 hover:bg-yellow-50 rounded" 
                    title="Revert to Pending"
                  >
                    <History className="w-5 h-5" />
                  </button>
                )}

                {/* Approval/Rejection buttons - only show for pending facilities */}
                {facility.moderationStatus === 'pending' && (
                  <>
                    <button 
                      onClick={() => onApprove(facility.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded" 
                      title="Approve Listing"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => onReject(facility.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded" 
                      title="Reject Listing"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Verification toggle */}
                <button 
                  onClick={() => onVerificationToggle(facility.id, facility.isVerified)}
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
                    onClick={() => onFeatureToggle(facility.id, facility.isFeatured)}
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
                  onClick={() => onEdit(facility)}
                  className="p-1 text-blue-600 hover:bg-blue-50 rounded" 
                  title="Edit"
                >
                  <Edit2 className="w-5 h-5" />
                </button>

                {/* Archive/Delete buttons */}
                {facility.moderationStatus !== 'archived' ? (
                  <button 
                    onClick={() => onArchive(facility.id)}
                    className="p-1 text-gray-600 hover:bg-gray-50 rounded" 
                    title="Archive"
                  >
                    <Archive className="w-5 h-5" />
                  </button>
                ) : (
                  <button 
                    onClick={() => onDelete(facility.id)}
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
  );
};
