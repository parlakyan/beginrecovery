import React from 'react';
import { Search, Box, Archive } from 'lucide-react';

interface FacilityFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  verificationFilter: string;
  onVerificationFilterChange: (value: string) => void;
  showArchived: boolean;
  onArchivedToggle: () => void;
}

export const FacilityFilters: React.FC<FacilityFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  verificationFilter,
  onVerificationFilterChange,
  showArchived,
  onArchivedToggle
}) => {
  return (
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
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* View Toggle */}
      <button
        onClick={onArchivedToggle}
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
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            className="px-4 py-2 border rounded-lg"
            value={verificationFilter}
            onChange={(e) => onVerificationFilterChange(e.target.value)}
          >
            <option value="all">All Verification</option>
            <option value="verified">Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      )}
    </div>
  );
};
